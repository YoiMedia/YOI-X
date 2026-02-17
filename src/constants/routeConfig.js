import Login from "../pages/auth/Login";
import ClientLogin from "../pages/auth/ClientLogin";
import VerifyMagicLink from "../pages/auth/VerifyMagicLink";
import SuperadminLogin from "../pages/auth/SuperadminLogin";
import Dashboard from "../pages/dashboard/Dashboard";
import UserList from "../pages/dashboard/UserList";
import AddUser from "../pages/dashboard/AddUser";
import ClientList from "../pages/clients/ClientList";
import AddClient from "../pages/clients/AddClient";
import EditClient from "../pages/clients/EditClient";
import MeetingList from "../pages/meetings/MeetingList";
import MeetingDetails from "../pages/meetings/MeetingDetails";
import PlaceholderPage from "../pages/placeholders/PlaceholderPage";
import RequirementsDashboard from "../pages/requirements/RequirementsDashboard";
import NewProject from "../pages/requirements/NewProject";
import NewRequirement from "../pages/requirements/NewRequirement";
import MyTasks from "../pages/tasks/MyTasks";
import QueryCenter from "../pages/tasks/QueryCenter";

export const publicRoutes = {
    auth: {
        basePath: "",
        routes: [
            { path: "login", component: Login },
            { path: "client-login", component: ClientLogin },
            { path: "verify", component: VerifyMagicLink },
            { path: "login-superadmin", component: SuperadminLogin },
        ],
    },
};

export const routeConfig = {
    dashboard: {
        basePath: "",
        routes: [{ path: "", component: Dashboard }],
    },
    users: {
        basePath: "users",
        allowedRoles: ["superadmin"],
        routes: [
            { path: "", component: UserList },
            { path: "add", component: AddUser },
        ],
    },
    clients: {
        basePath: "clients",
        allowedRoles: ["sales", "admin", "superadmin"],
        routes: [
            { path: "", component: ClientList },
            { path: "add", component: AddClient },
            { path: "edit/:id", component: EditClient },
        ],
    },
    proposals: {
        basePath: "proposals",
        allowedRoles: ["sales", "admin", "superadmin"],
        routes: [{ path: "", component: PlaceholderPage }],
    },
    meetings: {
        basePath: "meetings",
        allowedRoles: ["sales", "admin", "superadmin", "employee", "client"],
        routes: [
            { path: "", component: MeetingList },
            { path: ":id", component: MeetingDetails },
        ],
    },
    requirements: {
        basePath: "requirements",
        allowedRoles: ["sales", "admin", "superadmin", "employee", "client"],
        routes: [
            { path: "", component: RequirementsDashboard },
            { path: "new-project", component: NewProject },
            { path: "new-requirement", component: NewRequirement },
            { path: ":id", component: NewRequirement },
        ],
    },
    tasks: {
        basePath: "my-tasks",
        allowedRoles: ["admin", "superadmin", "employee"],
        routes: [{ path: "", component: MyTasks }],
    },
    queries: {
        basePath: "queries",
        allowedRoles: ["sales", "admin", "superadmin", "employee", "client"],
        routes: [{ path: "", component: QueryCenter }],
    },
    submissions: {
        basePath: "submissions",
        allowedRoles: ["sales", "admin", "superadmin", "employee", "client"],
        routes: [{ path: "", component: PlaceholderPage }],
    },
    documents: {
        basePath: "documents",
        allowedRoles: ["client"],
        routes: [{ path: "", component: PlaceholderPage }],
    },
    feedback: {
        basePath: "feedback",
        allowedRoles: ["client"],
        routes: [{ path: "", component: PlaceholderPage }],
    },
    support: {
        basePath: "support",
        allowedRoles: ["client"],
        routes: [{ path: "", component: PlaceholderPage }],
    },
};
