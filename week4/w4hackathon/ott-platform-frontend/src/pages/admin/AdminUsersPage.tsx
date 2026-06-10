import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  UserMinus,
  UserCheck,
  Shield,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import api from "../../lib/axios";

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/users/${id}/block`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const unblockMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/users/${id}/unblock`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const users = data?.results || [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-text-p text-[28px] font-bold">User Management</h1>
        <p className="text-text-s text-[14px] mt-1">
          Manage user accounts and access control.
        </p>
      </div>

      <div className="bg-surface border border-border-darker rounded-[12px] overflow-hidden">
        <div className="p-4 border-b border-border-darker bg-bg-darker">
          <div className="relative max-w-[400px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-s"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-bg-custom border border-border-darker rounded-[8px] pl-10 pr-4 py-2 text-[14px] text-text-p outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-darker bg-bg-darker/50">
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-darker">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-20 text-center text-text-s"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr
                    key={u.id}
                    className="hover:bg-bg-darker/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/10">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt=""
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-primary font-bold text-[14px]">
                              {u.name[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-text-p text-[14px] font-semibold">
                              {u.name}
                            </p>
                            {u.role === "admin" && (
                              <Shield size={12} className="text-primary" />
                            )}
                          </div>
                          <p className="text-text-s text-[12px] flex items-center gap-1">
                            <Mail size={10} /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase ${
                          u.isBlocked
                            ? "bg-primary/20 text-primary"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-s text-[13px] flex items-center gap-1.5 pt-7">
                      <Calendar size={14} />
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.isBlocked ? (
                        <button
                          onClick={() => unblockMutation.mutate(u.id)}
                          disabled={unblockMutation.isPending}
                          className="text-green-500 hover:text-green-400 text-[13px] font-semibold flex items-center gap-1 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {unblockMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <UserCheck size={16} />
                          )}
                          {unblockMutation.isPending
                            ? "Unblocking..."
                            : "Unblock"}
                        </button>
                      ) : (
                        <button
                          onClick={() => blockMutation.mutate(u.id)}
                          disabled={blockMutation.isPending}
                          className="text-primary hover:text-red-400 text-[13px] font-semibold flex items-center gap-1 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {blockMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <UserMinus size={16} />
                          )}
                          {blockMutation.isPending ? "Blocking..." : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
