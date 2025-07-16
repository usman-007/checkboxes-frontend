import { GRAFANA_DASHBOARD_URL } from "@/app/constants";

// Factory function to return TSX for a specific version
export const infoBoxContentFactory = (version: string): React.ReactNode => {
  switch (version) {
    case "v1.0":
      return (
        <>
          <h2 className="text-lg font-semibold mb-2">Checkboxes v1.0</h2>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Uses Redis as the primary data store.</li>
            <li>Backend built with Go.</li>
            <li>Frontend built with Next.js.</li>
            <li>Real-time updates via WebSockets and Redis Pub/Sub.</li>
            <li>Frontend deployed on AWS Amplify.</li>
            <li>Backend deployed on an AWS EC2 instance.</li>
            <li>CI/CD pipelines set up for both frontend and backend.</li>
            <li>
              Backend containerized with Docker and managed using Docker
              Compose.
            </li>
            <li>
              Grafana Dashboard combined with prometheus for monitoring.
              <span className="ml-2">
                You can view it{" "}
                <a
                  href={GRAFANA_DASHBOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-600"
                >
                  here
                </a>
                .
              </span>
            </li>
          </ul>
        </>
      );
    case "v2.0":
      return (
        <>
          <h2 className="text-lg font-semibold mb-2">Information v2.0</h2>
          <p>
            This is the description for version 0.2.0. Add your details here.
          </p>
        </>
      );
    default:
      return (
        <>
          <h2 className="text-lg font-semibold mb-2">Information</h2>
          <p>No information available for this version.</p>
        </>
      );
  }
};
