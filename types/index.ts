// types/index.ts - Tipos centralizados para el sistema de transferencias

import { ObjectId } from "mongoose";

// Tipos para Transferencias
export interface TransferType {
  _id: string;
  ticketId: {
    _id: string;
    eventName: string;
    eventDate: string;
  };
  previousOwnerId: {
    _id: string;
    name: string;
    email: string;
  };
  newOwnerId: {
    _id: string;
    name: string;
    email: string;
  };
  transferType: "direct_transfer" | "resale_purchase" | "admin_transfer";
  transferPrice?: number;
  transferDate: string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  updatedAt: string;
}

// Tipos para Estadísticas de Transferencias
export interface TransferStats {
  totalTransfers: number;
  directTransfers: number;
  resaleTransfers: number;
  adminTransfers: number;
  totalResaleValue: number;
  averageResalePrice: number;
}

// Tipos para Paginación
export interface PaginationType {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Tipos para Filtros de Transferencias
export interface TransferFilters {
  startDate?: Date;
  endDate?: Date;
  transferType?: string;
  userId?: string;
}

// Tipos para Tickets
export interface TicketType {
  _id: string;
  eventName: string;
  eventDate: string;
  price: number;
  disp: number;
  userId: string;
  currentOwnerId: string;
  forSale: boolean;
  transferDate?: string | null;
  isUsed: boolean;
  sold: boolean;
  purchaseDate: string;
  lastTransferDate?: string | null;
  transferCount: number;
  originalPrice?: number;
  qrCode?: string;
  status: "active" | "used" | "expired" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// Tipos para Respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface TransferListResponse {
  transfers: TransferType[];
  pagination: PaginationType;
}

export interface TransferStatsResponse {
  stats: TransferStats;
}

// Tipos para Formularios
export interface TransferFormData {
  ticketId: string;
  newUserId: string;
  notes?: string;
}

export interface FilterFormData {
  transferType: string;
  startDate: string;
  endDate: string;
  userId: string;
}

// Tipos para Sesión de Usuario
export interface UserSession {
  id: string;
  email: string;
  name: string;
  role?: "user" | "admin";
}

// Enums para mayor type safety
export enum TransferTypeEnum {
  DIRECT_TRANSFER = "direct_transfer",
  RESALE_PURCHASE = "resale_purchase",
  ADMIN_TRANSFER = "admin_transfer"
}

export enum TransferStatusEnum {
  COMPLETED = "completed",
  PENDING = "pending", 
  FAILED = "failed"
}

export enum TicketStatusEnum {
  ACTIVE = "active",
  USED = "used",
  EXPIRED = "expired",
  CANCELLED = "cancelled"
}