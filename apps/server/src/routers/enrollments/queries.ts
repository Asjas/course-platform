import { db } from "~/db/index.js";

export type AllEnrollmentsAsAdmin = Awaited<
  ReturnType<typeof getAllEnrollmentsAsAdmin>
>;

const preparedGetAllEnrollmentsAsAdmin = db.query.enrollment
  .findMany({
    with: {
      user: {
        columns: { id: true, name: true, email: true, image: true, role: true },
      },
      course: {
        columns: { id: true, name: true, slug: true },
      },
    },
    orderBy: (enrollment, { desc }) => [desc(enrollment.enrolledAt)],
  })
  .prepare("getAllEnrollmentsAsAdmin");

export async function getAllEnrollmentsAsAdmin() {
  return preparedGetAllEnrollmentsAsAdmin.execute();
}
