import { useNavigate } from "react-router-dom";
import { AddSite } from "../AddSite";
import { getToken } from "@/services/api";

const AddSiteWrapper = ({ onAddSite }: { onAddSite: (site: any) => void }) => {
  const navigate = useNavigate();

  const handleSave = async (site: any) => {
    try {
      // ✅ check auth before proceeding
      const token = getToken();
      if (!token) {
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      // ✅ normalize id (_id → id)
      const safeSite = { ...site, id: site.id || site._id };

      onAddSite(safeSite);
      navigate("/");
    } catch (err: any) {
      console.error("Failed to save site:", err);
      alert(err?.response?.data?.message || "Failed to add site");
    }
  };

  return (
    <AddSite
      onBack={() => navigate("/")}
      onSave={handleSave}
    />
  );
};

export default AddSiteWrapper;
