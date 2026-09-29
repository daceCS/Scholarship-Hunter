/* Backend seam. The UI only calls these two functions.
   TODO(backend): replace with real endpoints.
   - saveProgress: persist the raw answer state after every question (server-side progressive save).
   - submitAvatar: send the finished avatar object to the Step 2 search agent. */
window.TW = window.TW || {};
TW.api = {
  async saveProgress(/* state */) { /* browser localStorage only for now (see app.js) */ },
  async submitAvatar(avatar) {
    console.info('[intake] avatar ready for backend', avatar);
    await new Promise(r => setTimeout(r, 700));
    return { ok: true };
  }
};
