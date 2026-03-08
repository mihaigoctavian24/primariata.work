import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./components/pages/DashboardPage";
import { CereriPage } from "./components/pages/CereriPage";
import { DocumentePage } from "./components/pages/DocumentePage";
import { PlatiPage } from "./components/pages/PlatiPage";
import { CalendarPage } from "./components/pages/CalendarPage";
import { SetariPage } from "./components/pages/SetariPage";
import { UtilizatoriPage } from "./components/pages/UtilizatoriPage";
import { MonitorizarePage } from "./components/pages/MonitorizarePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "monitorizare", Component: MonitorizarePage },
      { path: "utilizatori", Component: UtilizatoriPage },
      { path: "cereri", Component: CereriPage },
      { path: "documente", Component: DocumentePage },
      { path: "plati", Component: PlatiPage },
      { path: "calendar", Component: CalendarPage },
      { path: "setari", Component: SetariPage },
    ],
  },
]);
