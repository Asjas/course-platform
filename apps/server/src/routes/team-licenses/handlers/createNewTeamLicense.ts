import type { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulid";
import {
  type NewTeamLicense,
  insertTeamLicense,
} from "~/db/mutations/teamLicense.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function createNewTeamLicenseHandler(
  request: FastifyRequest<{
    Body: {
      id: string;
      totalSeats: number;
      courseId: string;
      paymentId: string;
      invoiceId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:team-licenses:create",
  });

  const {
    id: purchaserId,
    totalSeats,
    courseId,
    paymentId,
    invoiceId,
  } = request.body;

  const newTeamLicense: NewTeamLicense = {
    id: ulid(),
    purchaserId,
    totalSeats,
    courseId,
    paymentId,
    invoiceId,
  };

  try {
    const result = await insertTeamLicense(newTeamLicense);

    if (!result) {
      log.error({ newTeamLicense }, "Failed to create team license");
      return reply.status(500).send({ error: "Failed to create team license" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    log.info({ id: result[0].id }, "Team license created successfully");

    return reply.status(201).send(result[0]);
  } catch (err) {
    log.error({ err, newTeamLicense }, "Error creating team license");
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
