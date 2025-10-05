import { ok, created, fail, badRequest, notFound } from "../../../utils/index.js";
import { getMyProfile, getProfileByUserId, upsertMyProfile } from "./service.js";

export const getMe = async (req, res) => {
  try {
    const profile = await getMyProfile(req.user.id);
    if (!profile) return ok(res, null, "No profile yet");
    return ok(res, profile);
  } catch (e) {
    return fail(res, e);
  }
};

export const getByUserId = async (req, res) => {
  try {
    const profile = await getProfileByUserId(req.params.userId);
    if (!profile) return notFound(res, "Profile not found");
    return ok(res, profile);
  } catch (e) {
    return fail(res, e);
  }
};

export const upsertMe = async (req, res) => {
  try {
    const saved = await upsertMyProfile(req.user.id, req.body);
    // created vs ok – upsert: we don’t know; just return 200 to be simple
    return ok(res, saved, "Profile saved");
  } catch (e) {
    if (e.status === 400) return badRequest(res, e.message, e.issues);
    return fail(res, e);
  }
};
