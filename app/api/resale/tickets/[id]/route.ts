import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import User from "@/models/User";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import mongoose from "mongoose";

interface Params {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    await connectToDB();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const ticket = await Ticket.findById(params.id);

    if (!ticket || !ticket.forSale) {
      return NextResponse.json({ message: "El ticket no está disponible" }, { status: 404 });
    }

    // Validar que el comprador no sea el propietario actual
    if (String(ticket.currentOwnerId) === String(session.user.id)) {
      return NextResponse.json({ message: "No puedes comprar tu propio ticket" }, { status: 400 });
    }

    // Actualizar ticket para transferir propiedad
    ticket.currentOwnerId = new mongoose.Types.ObjectId(session.user.id); // Nuevo propietario
    ticket.forSale = false;
    ticket.sold = true;
    ticket.transferDate = new Date();

    await ticket.save();

    // Notificación segura por consola
    console.log(
      `📢 Notificación: El ticket para "${ticket.eventName}" ha sido transferido al usuario ${session.user.email}.`
    );

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("Error en POST /api/resale/tickets/[id]/buy:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDB();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { buy, forSale, price, disp, isUsed } = await request.json();

    // COMPRA DE REVENTA
    if (buy) {
      const ticket = await Ticket.findById(params.id);
      if (!ticket || !ticket.forSale) {
        return NextResponse.json(
          { message: "Ticket no disponible" },
          { status: 400 }
        );
      }

      // Buscar emails de comprador y vendedor
      const comprador = await User.findById(session.user.id);
      const vendedor = await User.findById(ticket.userId);

      if (!comprador || !comprador.email) {
        return NextResponse.json(
          { message: "Usuario comprador sin email" },
          { status: 400 }
        );
      }
      if (!vendedor || !vendedor.email) {
        return NextResponse.json(
          { message: "Usuario vendedor sin email" },
          { status: 400 }
        );
      }

      // Guardar datos del vendedor antes de transferir
      const vendedorEmail = vendedor.email;
      const vendedorNombre = vendedor.name || vendedor.email;

      // Transferir el ticket al comprador
      ticket.userId = new (require("mongoose").Types.ObjectId)(session.user.id);
      ticket.forSale = false;
      ticket.transferDate = new Date();
      await ticket.save();

      // Generar QR para el comprador
      const qrData = JSON.stringify({
        eventName: ticket.eventName,
        ticketNumber: ticket._id,
        eventDate: ticket.eventDate,
        transferDate: ticket.transferDate,
      });
      const qrImage = await QRCode.toDataURL(qrData);

      // Configurar transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Correo al comprador (con QR)
      await transporter.sendMail({
        from: `"TicketZone" <${process.env.EMAIL_USER}>`,
        to: comprador.email,
        subject: "¡Has comprado una entrada en reventa!",
        html: `
          <h2>¡Compra de entrada en reventa exitosa!</h2>
          <p><b>Evento:</b> ${ticket.eventName}</p>
          <p><b>Fecha:</b> ${new Date(ticket.eventDate).toLocaleString(
            "es-CL"
          )}</p>
          <p><b>Número de ticket:</b> ${ticket._id}</p>
          <p>Escanea el siguiente QR para validar tu entrada:</p>
          <img src="${qrImage}" alt="QR de tu entrada" />
        `,
      });

      // Correo al vendedor (sin QR)
      await transporter.sendMail({
        from: `"TicketZone" <${process.env.EMAIL_USER}>`,
        to: vendedorEmail,
        subject: "¡Tu entrada se ha vendido!",
        html: `
          <h2>¡Felicidades, tu entrada ha sido vendida!</h2>
          <p>Has vendido tu ticket para el evento <b>${
            ticket.eventName
          }</b>.</p>
          <p><b>Fecha:</b> ${new Date(ticket.eventDate).toLocaleString(
            "es-CL"
          )}</p>
          <p><b>Número de ticket:</b> ${ticket._id}</p>
          <p>El nuevo dueño ya recibió su entrada.</p>
        `,
      });

      return NextResponse.json({
        message: "Compra realizada y correos enviados",
        ticket,
      });
    }

    // ACTUALIZAR ESTADO DE REVENTA (poner/quitar en venta, cambiar precio, etc.)
    const updates: any = {};
    if (forSale !== undefined) updates.forSale = forSale;
    if (price !== undefined) updates.price = price;
    if (disp !== undefined) updates.disp = disp;
    if (isUsed !== undefined) updates.isUsed = isUsed;

    const updated = await Ticket.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      updates,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Ticket no encontrado o no eres propietario" },
        { status: 404 }
      );
    }

    // Notificación segura por consola
    const accion =
      forSale === true ? "puesto en venta" : "retirado del mercado";
    const fecha = updated.eventDate
      ? new Date(updated.eventDate).toLocaleString("es-CL")
      : "fecha no disponible";

    console.log(
      `📢 Notificación: Tu ticket para "${updated.eventName}" (${fecha}) ha sido ${accion}.`
    );

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    console.error("Error en PUT /api/resale/tickets/[id]:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDB();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const updated = await Ticket.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { forSale: false },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Ticket no encontrado o no eres propietario" },
        { status: 404 }
      );
    }

    const fecha = updated.eventDate
      ? new Date(updated.eventDate).toLocaleString("es-CL")
      : "fecha no disponible";

    console.log(
      `📢 Notificación: Tu ticket para "${updated.eventName}" (${fecha}) ha sido retirado del mercado.`
    );

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    console.error("Error en DELETE /api/resale/tickets/[id]:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
