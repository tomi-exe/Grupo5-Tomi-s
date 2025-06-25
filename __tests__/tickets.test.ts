<<<<<<< Updated upstream
<<<<<<< Updated upstream
jest.mock('@/models/Ticket', () => {
  const fn: any = jest.fn();
  fn.find = jest.fn();
  fn.findById = jest.fn();
  return fn;
});
jest.mock('@/models/Event', () => {
  const fn: any = jest.fn();
  fn.findOne = jest.fn();
  return fn;
});
jest.mock('@/app/lib/auth', () => ({ getSession: jest.fn() }));
jest.mock('@/app/lib/mongodb', () => ({ connectToDB: jest.fn() }));

process.env.JWT_SECRET = 'testsecret';

import { POST } from '@/app/api/tickets/route';
import Ticket from '@/models/Ticket';
import { getSession } from '@/app/lib/auth';
import { connectToDB } from '@/app/lib/mongodb';
=======
jest.mock("@/models/Ticket", () => jest.fn());
jest.mock("@/app/lib/auth", () => ({ getSession: jest.fn() }));
jest.mock("@/app/lib/mongodb", () => ({ connectToDB: jest.fn() }));

import { POST } from "@/app/api/tickets/route";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import { connectToDB } from "@/app/lib/mongodb";
>>>>>>> Stashed changes

=======
jest.mock("@/models/Ticket", () => jest.fn());
jest.mock("@/app/lib/auth", () => ({ getSession: jest.fn() }));
jest.mock("@/app/lib/mongodb", () => ({ connectToDB: jest.fn() }));

import { POST } from "@/app/api/tickets/route";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import { connectToDB } from "@/app/lib/mongodb";

>>>>>>> Stashed changes
describe("POST /api/tickets", () => {
  const mockRequest = (body: any) =>
    ({
      json: jest.fn().mockResolvedValue(body),
    } as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when session is missing", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const req = mockRequest({});

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toBe("No autorizado");
<<<<<<< Updated upstream
  });

<<<<<<< Updated upstream
  it.each([
    { missing: 'eventName', body: { eventDate: '2024-01-01', price: 50, disp: 1 } },
    { missing: 'eventDate', body: { eventName: 'Concert', price: 50, disp: 1 } },
    { missing: 'price', body: { eventName: 'Concert', eventDate: '2024-01-01', disp: 1 } },
  ])('returns 400 when $missing is missing', async ({ body }) => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });

    const req = mockRequest(body);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe('Datos incompletos');
  });

  it('creates ticket and returns 201 for valid request', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
=======
  it("creates ticket and returns 201 for valid request", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
>>>>>>> Stashed changes
=======
  });

  it("creates ticket and returns 201 for valid request", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
>>>>>>> Stashed changes
    const save = jest.fn();
    (Ticket as unknown as jest.Mock).mockImplementation(() => ({ save }));

    const reqBody = {
      eventName: "Concert",
      eventDate: "2024-01-01",
      price: 50,
      disp: 2,
    };

    const req = mockRequest(reqBody);
    const res = await POST(req);

    expect(Ticket).toHaveBeenCalledWith({
      eventName: "Concert",
      eventDate: new Date("2024-01-01"),
      price: 50,
      disp: 2,
      userId: "user1",
      currentOwnerId: "user1",
      forSale: false,
      transferDate: null,
    });
    expect(save).toHaveBeenCalled();
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe("Compra registrada con éxito");
<<<<<<< Updated upstream
  });
});

describe('GET /api/tickets', () => {
  const mockRequest = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when session is missing', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const { GET } = await import('@/app/api/tickets/route');
    const res = await GET(mockRequest);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toBe('No autorizado');
  });

  it('returns tickets with qrToken when session is valid', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });

    const tickets = [
      {
        _id: '1',
        eventName: 'Concert',
        eventDate: new Date('2024-01-01'),
        price: 100,
      },
    ];

    (Ticket as any).find.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(tickets),
      }),
    });

    const { GET } = await import('@/app/api/tickets/route');
    const res = await GET(mockRequest);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tickets).toHaveLength(1);
    expect(data.tickets[0]).toHaveProperty('qrToken');
  });
});

describe('POST /api/checkin', () => {
  const mockRequest = (body: any) => ({ json: jest.fn().mockResolvedValue(body) }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when session is missing', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const { POST: CHECKIN } = await import('@/app/api/checkin/route');
    const res = await CHECKIN(mockRequest({ token: 'x' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when token is missing', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    const { POST: CHECKIN } = await import('@/app/api/checkin/route');
    const res = await CHECKIN(mockRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe('Token ausente');
  });

  it('returns 400 when token is invalid', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    const { POST: CHECKIN } = await import('@/app/api/checkin/route');
    const res = await CHECKIN(mockRequest({ token: 'bad' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe('Token inválido');
  });

  it('returns 404 when ticket not found', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    (Ticket as any).findById.mockResolvedValue(null);
    const token = require('jsonwebtoken').sign({ id: '1', eventName: 'Concert' }, process.env.JWT_SECRET!);
    const { POST: CHECKIN } = await import('@/app/api/checkin/route');
    const res = await CHECKIN(mockRequest({ token }));
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.message).toBe('Ticket no encontrado');
  });

  it('checks in ticket successfully', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });

    const saveTicket = jest.fn();
    (Ticket as any).findById.mockResolvedValue({
      isUsed: false,
      eventName: 'Concert',
      save: saveTicket,
    });

    const saveEvent = jest.fn();
    (require('@/models/Event') as any).findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ save: saveEvent }),
    });

    const token = require('jsonwebtoken').sign({ id: '1', eventName: 'Concert' }, process.env.JWT_SECRET!);
    const { POST: CHECKIN } = await import('@/app/api/checkin/route');
    const res = await CHECKIN(mockRequest({ token }));

    expect(saveTicket).toHaveBeenCalled();
    expect(saveEvent).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe('Check-in exitoso');
=======
>>>>>>> Stashed changes
  });
});
