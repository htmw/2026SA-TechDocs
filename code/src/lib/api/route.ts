import { getCurrentSession } from "@/app/actions";
import { createErrorResponse } from "@/lib/types/shared";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export type ApiRouteContext<PathParams = Record<string, string>, Body = unknown, Locals = Record<string, unknown>> = {
    req: NextRequest;
    params: PathParams;
    session?: Awaited<ReturnType<typeof getCurrentSession>>["session"];
    user?: Awaited<ReturnType<typeof getCurrentSession>>["user"];
    // A place for route-specific middleware to store values.
    locals: Locals;
    body?: Body;
};

export type ApiRouteOptions<PathParams = Record<string, string>, Body = unknown, Locals = Record<string, unknown>> = {
    // If true, the route will return 401 if the user is not authenticated. Defaults to true.
    require_auth?: boolean;
    // If provided, the request body will be parsed as JSON and validated using this schema.
    body_schema?: z.ZodType;
    // If provided, the route params will be validated using this schema.
    params_schema?: z.ZodType;
    // Allow routes that do not include a JSON body even if a body schema is provided.
    allow_empty_body?: boolean;
    // A list of middleware functions that run before the handler. If a middleware returns a NextResponse, it ends the route prematurely.
    middlewares?: Array<(
        context: ApiRouteContext<PathParams, Body, Locals>
    ) => Promise<NextResponse | void> | NextResponse | void>;
};

export type ApiMiddleware<PathParams = Record<string, string>, Body = unknown, Locals = Record<string, unknown>> = (
    context: ApiRouteContext<PathParams, Body, Locals>
) => Promise<NextResponse | void> | NextResponse | void;

type AuthenticatedApiRouteContext<PathParams = Record<string, string>, Body = unknown, Locals = Record<string, unknown>> =
    Omit<ApiRouteContext<PathParams, Body, Locals>, "user" | "session"> & {
        user: NonNullable<ApiRouteContext<PathParams, Body, Locals>["user"]>;
        session: NonNullable<ApiRouteContext<PathParams, Body, Locals>["session"]>;
    };

function createJsonErrorResponse() {
    return NextResponse.json(createErrorResponse("INVALID_JSON_BODY", "The request body is not valid JSON"), { status: 400 });
}

function createValidationErrorResponse(error: { format: () => any }) {
    return NextResponse.json(
        createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(error as any).fieldErrors),
        { status: 422 }
    );
}
// Overloads for typed auth.
export function createApiRoute<
    PathParams = Record<string, string>,
    Body = unknown,
    Locals = Record<string, unknown>
>(
    handler: (context: AuthenticatedApiRouteContext<PathParams, Body, Locals>) => Promise<NextResponse> | NextResponse,
    options?: ApiRouteOptions<PathParams, Body, Locals> & { require_auth?: true }
): (req: NextRequest, routeCtx: { params: Promise<PathParams> }) => Promise<NextResponse>;

export function createApiRoute<
    PathParams = Record<string, string>,
    Body = unknown,
    Locals = Record<string, unknown>
>(
    handler: (context: ApiRouteContext<PathParams, Body, Locals>) => Promise<NextResponse> | NextResponse,
    options: ApiRouteOptions<PathParams, Body, Locals> & { require_auth: false }
): (req: NextRequest, routeCtx: { params: Promise<PathParams> }) => Promise<NextResponse>;


/**
 * Wraps a Next.js App Router route handler to handle common functions such as authentication, JSON parsing, and Zod validation.
 * Support two forms:
 * 1) createApiRoute(handler, options)
 * 2) createApiRoute(middleware1, middleware2, ..., handler, options?)
 */
export function createApiRoute<
    PathParams = Record<string, string>,
    Body = unknown,
    Locals = Record<string, unknown>
>(...args: any[]) {

    if (args.length === 0) {
        throw new Error("createApiRoute requires at least a handler function");
    }

    let options: ApiRouteOptions<PathParams, Body, Locals> = {};
    let handler: (context: ApiRouteContext<PathParams, Body, Locals>) => Promise<NextResponse> | NextResponse;
    const middlewares: Array<ApiMiddleware<PathParams, Body, Locals>> = [];

    const lastArg = args[args.length - 1];
    if (typeof lastArg === "object" && lastArg !== null && !Array.isArray(lastArg)) {
        options = lastArg as ApiRouteOptions<PathParams, Body, Locals>;
        args = args.slice(0, -1);
    }

    if (args.length === 0) {
        throw new Error("createApiRoute requires a handler function");
    }

    handler = args[args.length - 1] as (context: ApiRouteContext<PathParams, Body, Locals>) => Promise<NextResponse> | NextResponse;
    const potentialMiddlewares = args.slice(0, -1);
    for (const mw of potentialMiddlewares) {
        if (typeof mw === "function") {
            middlewares.push(mw as ApiMiddleware<PathParams, Body, Locals>);
        }
    }

    options = {
        ...options,
        middlewares: [...(options.middlewares ?? []), ...middlewares],
    };

    const requireAuth = options.require_auth ?? true;

    return async (req: NextRequest, routeContext: { params: Promise<PathParams> }) => {
        const params = await routeContext.params;

        if (options.params_schema) {
            const parsed = options.params_schema.safeParse(params);
            if (!parsed.success) {
                return NextResponse.json(
                    createErrorResponse("VALIDATION_ERROR", "The request parameters are not valid", z.flattenError(parsed.error).fieldErrors),
                    { status: 422 }
                );
            }
        }

        let session: ApiRouteContext<PathParams, Body>["session"];
        let user: ApiRouteContext<PathParams, Body>["user"];

        if (requireAuth) {
            const auth = await getCurrentSession();
            session = auth.session;
            user = auth.user;
            if (!session || !user) {
                return NextResponse.json(
                    createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"),
                    { status: 401 }
                );
            }
        }

        let body: Body | undefined;
        if (options.body_schema) {
            try {
                body = (await req.json()) as Body;
            } catch (e) {
                return createJsonErrorResponse();
            }

            if (body === undefined && options.allow_empty_body) {
                // allow empty body without validation
            } else {
                const parsed = options.body_schema.safeParse(body);
                if (!parsed.success) {
                    return createValidationErrorResponse(parsed.error);
                }
                body = parsed.data as Body;
            }
        }

        const context: ApiRouteContext<PathParams, Body, Locals> = {
            req,
            params,
            session,
            user,
            body,
            locals: {} as Locals,
        };

        if (options.middlewares) {
            for (const middleware of options.middlewares) {
                const middlewareResult = await middleware(context);
                if (middlewareResult) {
                    return middlewareResult;
                }
            }
        }

        try {
            if (requireAuth) {
                return await (handler as any)(context as AuthenticatedApiRouteContext<PathParams, Body, Locals>);
            }
            return await handler(context);
        } catch (error) {
            return NextResponse.json(
                createErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred"),
                { status: 500 }
            );
        }
    };
}

/**
 * Creates a typed wrapper around `createApiRoute` so individual route files
 * can specify the `Params`, `Body`, and `Locals` types once and then call
 * the created function without repeating them.
 */
export function createTypedApiRoute<
    PathParams = Record<string, string>,
    Body = unknown,
    Locals = Record<string, unknown>
>(
    ...middlewares: Array<ApiMiddleware<PathParams, Body, Locals>>
) {
    type TypedRouteFactory = {
        (handler: (context: AuthenticatedApiRouteContext<PathParams, Body, Locals>) => Promise<NextResponse> | NextResponse, options?: ApiRouteOptions<PathParams, Body, Locals> & { require_auth?: true }): (req: NextRequest, routeCtx: { params: Promise<PathParams> }) => Promise<NextResponse>;
        (handler: (context: ApiRouteContext<PathParams, Body, Locals>) => Promise<NextResponse> | NextResponse, options: ApiRouteOptions<PathParams, Body, Locals> & { require_auth: false }): (req: NextRequest, routeCtx: { params: Promise<PathParams> }) => Promise<NextResponse>;
    };

    const factory = (
        handler: any,
        options?: ApiRouteOptions<PathParams, Body, Locals>
    ) => {
        const args: any[] = [...middlewares, handler];
        if (options) args.push(options);
        return (createApiRoute as any).apply(null, args);
    };

    return factory as unknown as TypedRouteFactory;
}
