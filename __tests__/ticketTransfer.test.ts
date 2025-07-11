import { PUT } from "@/app/api/tickets/route";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import { connectToDB } from "@/app/lib/mongodb";
import { TransferService } from "@/app/lib/transferService";

jest.mock("@/models/Ticket", () => {
  const fn: any = jest.fn();
  fn.findById = jest.fn();
  return fn;
});
jest.mock("@/app/lib/auth", () => ({ getSession: jest.fn() }));
jest.mock("@/app/lib/mongodb", () => ({ connectToDB: jest.fn() }));
jest.mock("@/app/lib/transferService", () => ({
  TransferService: { recordTransfer: jest.fn() },
}));

const mockRequest = (body: any) =>
  ({ json: jest.fn().mockResolvedValue(body) } as any);

describe("PUT /api/tickets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when session is missing", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const res = await PUT(mockRequest({}));
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is incomplete", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    const res = await PUT(mockRequest({ ticketId: "t1" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when ticket not found", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (Ticket as any).findById.mockResolvedValue(null);
    const res = await PUT(mockRequest({ ticketId: "t1", newUserId: "u2" }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when not owner", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (Ticket as any).findById.mockResolvedValue({
      _id: "t1",
      userId: { toString: () => "other" },
      currentOwnerId: { toString: () => "other" },
    });
    const res = await PUT(mockRequest({ ticketId: "t1", newUserId: "u2" }));
    expect(res.status).toBe(403);
  });

  it("transfers ticket when data valid", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    const save = jest.fn();
    const ticket = {
      _id: "t1",
      userId: { toString: () => "u1" },
      currentOwnerId: { toString: () => "u1" },
      forSale: true,
      transferDate: null,
      save,
    } as any;
    (Ticket as any).findById.mockResolvedValue(ticket);

    const res = await PUT(mockRequest({ ticketId: "t1", newUserId: "u2" }));

    expect(TransferService.recordTransfer).toHaveBeenCalledWith({
      ticketId: "t1",
      previousOwnerId: "u1",
      newOwnerId: "u2",
      transferType: "direct_transfer",
      notes: "Transferencia directa entre usuarios",
      request: expect.anything(),
    });
    expect(ticket.currentOwnerId).toBe("u2");
    expect(ticket.forSale).toBe(false);
    expect(save).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
