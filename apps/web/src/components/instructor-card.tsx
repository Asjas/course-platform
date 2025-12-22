export default function InstructorCard({
  hideHeading,
}: {
  hideHeading?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
      <div className="p-6">
        <h3
          className={`mb-4 text-xl font-bold text-gray-900 dark:text-white ${hideHeading ? "hidden" : "block"}`}
        >
          Your Instructor
        </h3>
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <img
              className="h-full w-full object-cover"
              alt="Codewizard"
              src="/codewizard.jpg"
            />
          </div>
          <div className="grow">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Codewizard (A-J Roos)
            </h4>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Full-Stack Web Developer &amp; Educator
            </p>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              As a full-stack web developer with years of experience tackling
              programming challenges, I’m driven by a passion for helping
              developers master the tools and techniques that streamline their
              coding process and make it more rewarding. I love sharing
              battle-tested insights and practical solutions that you can put to
              work right away.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
