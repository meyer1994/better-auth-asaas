import { APIError, createAuthMiddleware } from "better-auth/api";

/**
 * Middleware to require a user to have an Asaas customer ID.
 * 
 * @throws {APIError} UNAUTHORIZED - User not found
 * @throws {APIError} UNAUTHORIZED - User does not have Asaas customer ID
 */
export const requireAsaasCustomerId = createAuthMiddleware(async ctx => {
  const user = ctx.context.session?.user;

  if (!user) throw new APIError("UNAUTHORIZED", {
    message: 'User not found'
  });

  if (!user.asaasCustomerId) throw new APIError("UNAUTHORIZED", {
    message: `${user.email} does not have assaasCustomerId`,
  });

  ctx.context.logger.info(
    'User has Asaas customer ID',
    { email: user.email, asaasCustomerId: user.asaasCustomerId }
  );
});
