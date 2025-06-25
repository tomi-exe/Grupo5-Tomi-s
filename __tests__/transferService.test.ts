import { TransferService } from "@/app/lib/transferService";
import Transfer from "@/models/Transfer";
import User from "@/models/User";
import Ticket from "@/models/Ticket";
import { connectToDB } from "@/app/lib/mongodb";

jest.mock("@/models/Transfer", () => {
  const fn: any = jest.fn();
  fn.find = jest.fn();
  fn.aggregate = jest.fn();
  fn.countDocuments = jest.fn();
  return fn;
});
jest.mock("@/models/User", () => {
  const fn: any = jest.fn();
  fn.findById = jest.fn();
  return fn;
});
jest.mock("@/models/Ticket", () => {
  const fn: any = jest.fn();
  fn.findById = jest.fn();
  return fn;
});
jest.mock("@/app/lib/mongodb", () => ({ connectToDB: jest.fn() }));

describe("TransferService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("recordTransfer", () => {
    it("saves transfer with request info", async () => {
      (Ticket as any).findById.mockResolvedValue({
        _id: "t1",
        eventName: "Concert",
        eventDate: new Date("2024-01-01"),
      });
      (User as any).findById
        .mockResolvedValueOnce({ email: "old@mail.com", name: "Old" })
        .mockResolvedValueOnce({ email: "new@mail.com", name: "New" });
      const save = jest.fn();
      (Transfer as unknown as jest.Mock).mockImplementation(() => ({ save }));

      const request = {
        headers: new Headers({
          "x-forwarded-for": "1.1.1.1",
          "user-agent": "ua",
        }),
      } as any;

      await TransferService.recordTransfer({
        ticketId: "t1",
        previousOwnerId: "u1",
        newOwnerId: "u2",
        transferType: "direct_transfer",
        transferPrice: 5,
        notes: "note",
        request,
      });

      expect(connectToDB).toHaveBeenCalled();
      expect(Transfer).toHaveBeenCalledWith({
        ticketId: "t1",
        eventName: "Concert",
        eventDate: new Date("2024-01-01"),
        previousOwnerId: "u1",
        previousOwnerEmail: "old@mail.com",
        previousOwnerName: "Old",
        newOwnerId: "u2",
        newOwnerEmail: "new@mail.com",
        newOwnerName: "New",
        transferType: "direct_transfer",
        transferPrice: 5,
        ipAddress: "1.1.1.1",
        userAgent: "ua",
        notes: "note",
        status: "completed",
      });
      expect(save).toHaveBeenCalled();
    });
  });

  const createQueryMock = (result: any) => {
    const q: any = {};
    q.sort = jest.fn(() => q);
    q.skip = jest.fn(() => q);
    q.limit = jest.fn(() => q);
    q.populate = jest.fn(() => q);
    q.exec = jest.fn().mockResolvedValue(result);
    q.then = (resolve: any, reject: any) =>
      Promise.resolve(result).then(resolve, reject);
    return q;
  };

  it("getTicketTransferHistory returns transfers", async () => {
    const transfers = [{ id: 1 }];
    (Transfer as any).find.mockReturnValue(createQueryMock(transfers));
    const result = await TransferService.getTicketTransferHistory("t1");
    expect(Transfer.find).toHaveBeenCalledWith({ ticketId: "t1" });
    expect(result).toEqual(transfers);
  });

  it("getUserTransferHistory returns transfers", async () => {
    const transfers = [{ id: 2 }];
    (Transfer as any).find.mockReturnValue(createQueryMock(transfers));
    const result = await TransferService.getUserTransferHistory("u1");
    expect(Transfer.find).toHaveBeenCalledWith({
      $or: [{ previousOwnerId: "u1" }, { newOwnerId: "u1" }],
    });
    expect(result).toEqual(transfers);
  });

  it("getAllTransfers paginates and counts", async () => {
    const transfers = [{ id: 3 }];
    (Transfer as any).find.mockReturnValue(createQueryMock(transfers));
    (Transfer as any).countDocuments.mockResolvedValue(10);
    const result = await TransferService.getAllTransfers(2, 4, {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-02"),
      transferType: "direct_transfer",
      userId: "u1",
    });
    expect(Transfer.find).toHaveBeenCalled();
    expect(result.transfers).toEqual(transfers);
    expect(result.pagination).toEqual({
      currentPage: 2,
      totalPages: Math.ceil(10 / 4),
      totalItems: 10,
      itemsPerPage: 4,
    });
  });

  it("getTransferStats aggregates results", async () => {
    const stats = [{ totalTransfers: 5 }];
    (Transfer as any).aggregate.mockResolvedValue(stats);
    const result = await TransferService.getTransferStats();
    expect(Transfer.aggregate).toHaveBeenCalled();
    expect(result).toEqual(stats[0]);
  });
});
