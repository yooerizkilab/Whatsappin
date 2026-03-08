# Multi-Agent & Role Permissions

This feature allows primary users (`USER`) to create sub-accounts (`AGENT`) with restricted permissions. This is ideal for teams where multiple customer service agents need to handle messages using a single business WhatsApp account.

## Core Concepts

- **Primary User (`USER`)**: The main account holder who manages subscriptions, billing, and team members.
- **Agent (`AGENT`)**: Sub-accounts created by a primary user. They share the devices, contacts, and message history of the primary user but have restricted access to management settings.
- **Data Scoping**: Agents automatically work within the context of their parent account (`ownerId`). All contacts fetched, messages sent, and logs viewed are filtered by this `ownerId`.

## Permissions System

Each agent can be granted granular permissions (stored as JSON in the database):

| Permission          | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `canSendMessages`   | Ability to send individual and blast messages.       |
| `canManageContacts` | Ability to add, edit, or delete contacts and groups. |
| `canViewAnalytics`  | Access to the analytics dashboard.                   |

_Note: Critical management features (Billing, API Keys, Team Management, Webhooks) are strictly restricted to Primary Users and Admins._

## API Endpoints

### Team Management (Primary User only)

- `GET /api/agents` - List all sub-accounts.
- `POST /api/agents` - Create a new agent.
- `PUT /api/agents/:id` - Update agent details or permissions.
- `DELETE /api/agents/:id` - Remove an agent.

## Implementation Details

1.  **Authentication**: The `auth` middleware extracts the `parentId` from the JWT and calculates an `ownerId`.
2.  **Controller Scoping**: All resource controllers use `request.user.ownerId` for querying the database.
3.  **UI Components**:
    - **Team Page**: Accessible at `/team` for primary users to manage their staff.
    - **Sidebar**: Conditionally hides menus based on the user's role.
