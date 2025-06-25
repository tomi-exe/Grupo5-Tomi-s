jest.mock('@/models/Ticket', () => jest.fn());
jest.mock('@/app/lib/auth', () => ({ getSession: jest.fn() }));
jest.mock('@/app/lib/mongodb', () => ({ connectToDB: jest.fn() }));

import { POST } from '@/app/api/tickets/route';
import Ticket from '@/models/Ticket';
import { getSession } from '@/app/lib/auth';
import { connectToDB } from '@/app/lib/mongodb';

describe('POST /api/tickets', () => {
  const mockRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body),
  }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when session is missing', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const req = mockRequest({});

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toBe('No autorizado');
  });

  it('creates ticket and returns 201 for valid request', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    const save = jest.fn();
    (Ticket as jest.Mock).mockImplementation(() => ({ save }));

    const reqBody = {
      eventName: 'Concert',
      eventDate: '2024-01-01',
      price: 50,
      disp: 2,
    };

    const req = mockRequest(reqBody);
    const res = await POST(req);

    expect(Ticket).toHaveBeenCalledWith({
      eventName: 'Concert',
      eventDate: new Date('2024-01-01'),
      price: 50,
      disp: 2,
      userId: 'user1',
      currentOwnerId: 'user1',
      forSale: false,
      transferDate: null,
    });
    expect(save).toHaveBeenCalled();
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe('Compra registrada con éxito');
  });
});
