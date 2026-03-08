import { ClientSession } from "@/lib/types/mongo_session_types"
import { ClientUser } from "@/lib/types/mongo_user_types"

export interface ApiError {
    code: string
    message: string
    fields?: Record<string, string | string[] | undefined>
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: ApiError
}

export function createErrorResponse(code: string, message: string, fields?: Record<string, string | string[] | undefined>): ApiResponse<null> {
    return {
        success: false,
        error: {
            code,
            message,
            fields,
        },
    }
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
        success: true,
        data,
    }
}

export type AuthState = {
    session: ClientSession;
    user: ClientUser;
} | {
    session: null;
    user: null
};