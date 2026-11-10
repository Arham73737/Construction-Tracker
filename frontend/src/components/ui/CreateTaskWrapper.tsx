import { useNavigate, useParams } from "react-router-dom";
import { CreateTask } from "../CreateTask";
const CreateTaskWrapper = () => {
  const navigate = useNavigate();
  const { siteId, floorId } = useParams();
  if (!siteId || !floorId) return <div>Error: Missing site or floor ID</div>;
  return (
    <CreateTask
      siteId={siteId}
      floorId={floorId}
      sites={[]}
      onBack={() => navigate("/")}
      onSave={(task) => {
        console.log("Task saved:", task);
        navigate("/");
      }}
    />
  );
};

export default CreateTaskWrapper;
