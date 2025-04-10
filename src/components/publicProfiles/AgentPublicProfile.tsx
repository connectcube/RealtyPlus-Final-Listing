import { useParams } from "react-router-dom";

export default function AgentPublicProfile() {
  const { id } = useParams();

  // Now you can use the id parameter
  console.log("Agent ID:", id);

  return <div>{/* Your component JSX here */}</div>;
}
