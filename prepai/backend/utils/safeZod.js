let realZod = null;
try {
  realZod = require("zod");
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") {
    console.error("[PrepAI] Error loading zod:", e);
  } else {
    console.warn(
      "[PrepAI WARNING] 'zod' is not installed in the current environment's node_modules.\n" +
      "Falling back to resilient schema validator to prevent server crash.\n" +
      "To resolve in production, make sure 'zod' is in package.json dependencies and run 'npm install'."
    );
  }
}

class FallbackZodError extends Error {
  constructor(errors = []) {
    super(errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
    this.name = "ZodError";
    this.errors = errors;
  }
}

class SchemaValidator {
  constructor(checkFn) {
    this._checks = checkFn ? [checkFn] : [];
    this._isOptional = false;
  }

  optional() {
    const clone = new SchemaValidator();
    clone._checks = [...this._checks];
    clone._isOptional = true;
    return clone;
  }

  min(length, message) {
    this._checks.push((val, path) => {
      if (typeof val === "string" && val.length < length) {
        return { path: [path], message: message || `Must be at least ${length} characters` };
      }
      if (Array.isArray(val) && val.length < length) {
        return { path: [path], message: message || `Must contain at least ${length} items` };
      }
      return null;
    });
    return this;
  }

  email(message) {
    this._checks.push((val, path) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof val === "string" && !emailRegex.test(val)) {
        return { path: [path], message: message || "Invalid email address" };
      }
      return null;
    });
    return this;
  }

  parse(data, path = "body") {
    if (this._isOptional && (data === undefined || data === null)) {
      return data;
    }
    const errors = [];
    for (const check of this._checks) {
      const err = check(data, path);
      if (err) {
        if (Array.isArray(err)) errors.push(...err);
        else errors.push(err);
      }
    }
    if (errors.length > 0) {
      throw new FallbackZodError(errors);
    }
    return data;
  }
}

const fallbackZ = {
  ZodError: FallbackZodError,
  string: () =>
    new SchemaValidator((val, path) => {
      if (typeof val !== "string") {
        return { path: [path], message: "Expected string, received " + typeof val };
      }
      return null;
    }),
  number: () =>
    new SchemaValidator((val, path) => {
      if (typeof val !== "number" || isNaN(val)) {
        return { path: [path], message: "Expected number, received " + typeof val };
      }
      return null;
    }),
  union: (schemas) =>
    new SchemaValidator((val, path) => {
      let passed = false;
      for (const s of schemas) {
        try {
          s.parse(val, path);
          passed = true;
          break;
        } catch (_) {}
      }
      if (!passed) {
        return { path: [path], message: "Invalid value for union type" };
      }
      return null;
    }),
  array: (itemSchema) => {
    const validator = new SchemaValidator((val, path) => {
      if (!Array.isArray(val)) {
        return { path: [path], message: "Expected array, received " + typeof val };
      }
      const itemErrors = [];
      val.forEach((item, index) => {
        try {
          itemSchema.parse(item, `${path}[${index}]`);
        } catch (err) {
          if (err && err.errors) itemErrors.push(...err.errors);
        }
      });
      return itemErrors.length > 0 ? itemErrors : null;
    });
    return validator;
  },
  object: (shape) =>
    new SchemaValidator((val, path = "body") => {
      if (!val || typeof val !== "object" || Array.isArray(val)) {
        return { path: [path], message: "Expected object, received " + typeof val };
      }
      const objErrors = [];
      for (const [key, fieldValidator] of Object.entries(shape)) {
        const fieldVal = val[key];
        try {
          fieldValidator.parse(fieldVal, key);
        } catch (err) {
          if (err && err.errors) {
            objErrors.push(...err.errors);
          } else if (err) {
            objErrors.push({ path: [key], message: err.message });
          }
        }
      }
      return objErrors.length > 0 ? objErrors : null;
    }),
};

// Export real Zod if installed, otherwise fallbackZ
const exportedZ = realZod ? (realZod.z || realZod) : fallbackZ;
const exportedZodError = realZod ? (realZod.ZodError || realZod.z?.ZodError || FallbackZodError) : FallbackZodError;

module.exports = {
  z: exportedZ,
  ZodError: exportedZodError,
  isZodInstalled: !!realZod,
};
