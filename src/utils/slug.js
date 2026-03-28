const slugify = require("slugify");

function toGuestSlug(fullName) {
  return slugify(fullName, {
    lower: true,
    strict: true,
    trim: true,
    locale: "es",
  });
}

module.exports = { toGuestSlug };
