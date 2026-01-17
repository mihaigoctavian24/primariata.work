/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useNotificationsRealtime } from "@/hooks/use-notifications-realtime";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Notification } from "@/types/notifications";

// Mock dependencies
jest.mock("@/lib/supabase/client");
jest.mock("sonner");

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe("useNotificationsRealtime", () => {
  let queryClient: QueryClient;
  let mockSupabase: jest.Mocked<ReturnType<typeof createClient>>;
  let mockChannel: jest.Mocked<{
    on: jest.Mock;
    subscribe: jest.Mock;
  }>;

  beforeEach(() => {
    // Reset query client
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup mock channel
    mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn((callback) => {
        // Simulate successful subscription
        setTimeout(() => callback("SUBSCRIBED"), 0);
        return mockChannel;
      }),
    } as jest.Mocked<{
      on: jest.Mock;
      subscribe: jest.Mock;
    }>;

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
      },
      channel: jest.fn(() => mockChannel),
      removeChannel: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockSupabase);

    // Mock toast functions
    mockToast.info = jest.fn();
    mockToast.error = jest.fn();

    // Clear console logs in tests
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it("should create Supabase client on mount", () => {
    renderHook(() => useNotificationsRealtime(), { wrapper });

    expect(mockCreateClient).toHaveBeenCalledTimes(1);
  });

  it("should subscribe to notifications channel with user filter", async () => {
    renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(mockSupabase.channel).toHaveBeenCalledWith("notifications-realtime");
    });

    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: "utilizator_id=eq.test-user-id",
      },
      expect.any(Function)
    );

    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it("should return connected status after successful subscription", async () => {
    const { result } = renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(result.current.connectionStatus).toBe("connected");
  });

  it("should invalidate queries on notification change", async () => {
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useNotificationsRealtime(), { wrapper });

    // Get the postgres_changes callback
    await waitFor(() => {
      expect(mockChannel.on).toHaveBeenCalled();
    });

    const postgresCallback = mockChannel.on.mock.calls[0][2];

    // Simulate INSERT event
    const mockNotification: Notification = {
      id: "notif-1",
      utilizator_id: "test-user-id",
      primarie_id: "primarie-1",
      type: "cerere_approved",
      priority: "medium",
      title: "Test notification",
      message: "Test message",
      action_url: null,
      action_label: null,
      dismissed_at: null,
      read_at: null,
      metadata: null,
      created_at: new Date().toISOString(),
      expires_at: null,
    };

    postgresCallback({
      eventType: "INSERT",
      new: mockNotification,
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["notifications"],
    });
  });

  it("should show toast for urgent priority notifications", async () => {
    renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(mockChannel.on).toHaveBeenCalled();
    });

    const postgresCallback = mockChannel.on.mock.calls[0][2];

    const urgentNotification: Notification = {
      id: "notif-2",
      utilizator_id: "test-user-id",
      primarie_id: "primarie-1",
      type: "payment_due",
      priority: "urgent",
      title: "Plată urgentă",
      message: "Aveți o plată scadentă",
      action_url: "https://example.com",
      action_label: "Plătește acum",
      dismissed_at: null,
      read_at: null,
      metadata: null,
      created_at: new Date().toISOString(),
      expires_at: null,
    };

    postgresCallback({
      eventType: "INSERT",
      new: urgentNotification,
    });

    expect(mockToast.info).toHaveBeenCalledWith("Plată urgentă", {
      description: "Aveți o plată scadentă",
      duration: 5000,
      action: expect.objectContaining({
        label: "Plătește acum",
        onClick: expect.any(Function),
      }),
    });
  });

  it("should show toast for high priority notifications", async () => {
    renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(mockChannel.on).toHaveBeenCalled();
    });

    const postgresCallback = mockChannel.on.mock.calls[0][2];

    const highPriorityNotification: Notification = {
      id: "notif-3",
      utilizator_id: "test-user-id",
      primarie_id: "primarie-1",
      type: "deadline_approaching",
      priority: "high",
      title: "Termen aproape",
      message: "Aveți 2 zile până la termen",
      action_url: null,
      action_label: null,
      dismissed_at: null,
      read_at: null,
      metadata: null,
      created_at: new Date().toISOString(),
      expires_at: null,
    };

    postgresCallback({
      eventType: "INSERT",
      new: highPriorityNotification,
    });

    expect(mockToast.info).toHaveBeenCalledWith("Termen aproape", {
      description: "Aveți 2 zile până la termen",
      duration: 5000,
      action: undefined,
    });
  });

  it("should NOT show toast for medium/low priority notifications", async () => {
    renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(mockChannel.on).toHaveBeenCalled();
    });

    const postgresCallback = mockChannel.on.mock.calls[0][2];

    const mediumNotification: Notification = {
      id: "notif-4",
      utilizator_id: "test-user-id",
      primarie_id: "primarie-1",
      type: "info",
      priority: "medium",
      title: "Info",
      message: "Informație generală",
      action_url: null,
      action_label: null,
      dismissed_at: null,
      read_at: null,
      metadata: null,
      created_at: new Date().toISOString(),
      expires_at: null,
    };

    postgresCallback({
      eventType: "INSERT",
      new: mediumNotification,
    });

    expect(mockToast.info).not.toHaveBeenCalled();
  });

  it("should handle UPDATE and DELETE events without showing toast", async () => {
    renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(mockChannel.on).toHaveBeenCalled();
    });

    const postgresCallback = mockChannel.on.mock.calls[0][2];
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    // Simulate UPDATE event
    postgresCallback({
      eventType: "UPDATE",
      new: {},
    });

    expect(invalidateQueriesSpy).toHaveBeenCalled();
    expect(mockToast.info).not.toHaveBeenCalled();

    invalidateQueriesSpy.mockClear();

    // Simulate DELETE event
    postgresCallback({
      eventType: "DELETE",
      old: {},
    });

    expect(invalidateQueriesSpy).toHaveBeenCalled();
    expect(mockToast.info).not.toHaveBeenCalled();
  });

  it("should handle connection errors gracefully", async () => {
    mockChannel.subscribe = jest.fn((callback) => {
      setTimeout(() => callback("CHANNEL_ERROR"), 0);
      return mockChannel;
    });

    const { result } = renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe("error");
    });

    expect(mockToast.error).toHaveBeenCalledWith("Conexiune întreruptă", {
      description: "Notificările în timp real sunt temporar indisponibile",
      duration: 4000,
    });
  });

  it("should cleanup subscription on unmount", async () => {
    const { unmount } = renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    unmount();

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it("should handle user not found", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe("error");
    });

    expect(mockSupabase.channel).not.toHaveBeenCalled();
  });

  it("should handle auth error", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Auth error"),
    });

    const { result } = renderHook(() => useNotificationsRealtime(), { wrapper });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe("error");
    });

    expect(mockSupabase.channel).not.toHaveBeenCalled();
  });
});
