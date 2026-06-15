import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import Mock from "./pages/Mock";
import Progress from "./pages/Progress";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="practice" element={<Practice />} />
        <Route path="mock" element={<Mock />} />
        <Route path="progress" element={<Progress />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
