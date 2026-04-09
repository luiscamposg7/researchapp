import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function EditorOnly({ children }) {
  const { isEditor } = useApp();
  const navigate = useNavigate();
  useEffect(() => { if (!isEditor) navigate("/research", { replace: true }); }, [isEditor, navigate]);
  return isEditor ? children : null;
}
