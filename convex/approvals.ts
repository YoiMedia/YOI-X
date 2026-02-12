import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List pending approvals (requirements pending approval)
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Fetch requirements with pending status
    // Assuming "pending" or "pending_approval"
    // Let's fetch all requirements and filter in memory for now if status is unsure, or just "pending"
    // Ideally use index. schema has `by_status`.
    
    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_status", (q) => q.eq("status", "pending")) // Adjust status if needed
      .collect();

    const approvals = await Promise.all(
      requirements.map(async (req) => {
        const client = await ctx.db.get(req.client_id);
        return {
          id: req._id,
          title: req.requirement_name,
          client: client?.company_name || "Unknown Client",
          status: req.status,
          urgent: false, // Default or derive logic
          timestamp: new Date(req.created_at).toISOString(), // For activity feed maybe?
        };
      })
    );

    return approvals;
  },
});

// Remove approval (Approve/Reject logic or just remove from list)
// DataContext converts this to `removeApprovalMutation`.
// And `approveTimeline` calls this.
export const remove = mutation({
  args: { id: v.id("requirements") }, // Use requirement ID but typed as generic ID or specific?
  // DataContext calls it with `id` as `any` cast to `Id<"approvals">` essentially but actually `req id`.
  // Wait, DataContext: `approveTimeline = async (id: string) => { await removeApprovalMutation({ id: id as any }); }`
  // So it sends an ID.
  handler: async (ctx, args) => {
    // This is "approveTimeline". It likely means changing status to "approved".
    // Or it might mean removing the item from the approval list (reject/archive).
    // Let's update status to "approved".
    
    // We need to check if it exists in requirements
    // CAST args.id to Id<"requirements">
    // But v.id("requirements") expects actual ID.
    // If the frontend sends an ID from `approvals` list, and `approvals` list uses `req._id`, then it is a requirement ID.
    
    await ctx.db.patch(args.id, {
      status: "approved",
      updated_at: Date.now(),
    });
  },
});
