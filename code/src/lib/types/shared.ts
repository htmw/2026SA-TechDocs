import { ClientSession } from "@/lib/types/mongo_session_types"
import { ClientUser } from "@/lib/types/mongo_user_types"

/**
 * A standard API error type that can be used for all API endpoints. 
 * It includes a code, message, and optional fields for detailed error information.
 */
export interface ApiError {
    code: string
    message: string
    fields?: Record<
        string,
        string |
        string[] |
        Record<string, string | Record<string, string> | string[] | undefined> |
        undefined
    >
}

/**
 *  A standard API response type that can be used for all API endpoints.
 *  It includes a success boolean, an optional data field of type T, and an optional error field of type ApiError.
 */
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: ApiError
}

/**
 * Creates an error response for API calls.
 * @param code A string code representing the error type, e.g. "VALIDATION_ERROR", "NOT_FOUND", etc.
 * @param message The error message.
 * @param fields Optional fields for detailed error information.
 * @returns The error response object.
 */
export function createErrorResponse(code: string, message: string, fields?: Record<string, string | string[] | Record<string, string | Record<string, string> | string[] | undefined> | undefined>): ApiResponse<null> {
    return {
        success: false,
        error: {
            code,
            message,
            fields,
        },
    }
}

/**
 * Creates a success response for API calls.
 * @param data The data to include in the success response.
 * @returns The success response object.
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
        success: true,
        data,
    }
}

/**
 * Type representing the authentication state of the user.
 * It can either be an authenticated state with a session and user, or an unauthenticated state with null values.
 */
export type AuthState = {
    session: ClientSession;
    user: ClientUser;
} | {
    session: null;
    user: null
};