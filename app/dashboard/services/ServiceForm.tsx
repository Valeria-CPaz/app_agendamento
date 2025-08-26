"use client";

import { useState } from "react";
import { ServiceFormSchema } from "./ServiceFormSchema";

// You don't need Props if there are no props used
export default function ServiceForm() {
    const [form, setForm] = useState({
        name: "",
        duration: 50,
        priceCents: 0,
        online: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Handles form submission
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Validate using Zod schema
        const result = ServiceFormSchema.safeParse({
            ...form,
            duration: Number(form.duration),
            priceCents: Number(form.priceCents),
            online: !!form.online,
        });

        if (!result.success) {
            // Parse Zod errors into readable object
            const zodErrors = Object.fromEntries(
                result.error.issues.map((err: any) => [err.path[0], err.message])
            );
            setErrors(zodErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        // Send request to API route
        const res = await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.data),
        });

        setLoading(false);

        if (res.ok) {
            setForm({
                name: "",
                duration: 50,
                priceCents: 0,
                online: true,
            });
            window.location.reload(); // Forces page reload to show updated list
        } else {
            const errorData = await res.json();
            if (errorData.details && Array.isArray(errorData.details)) {
                // Handle server-side Zod errors
                const serverErrors = Object.fromEntries(
                    errorData.details.map((err: any) => [err.path[0], err.message])
                );
                setErrors(serverErrors);
            } else {
                setErrors({ general: errorData.error || "Something went wrong" });
            }
        }
    }

    // Handles input changes
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    return (
        <form className="space-y-3 mt-6" onSubmit={handleSubmit}>
            <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full"
                    required
                />
                {errors.name && (
                    <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                )}
            </div>
            <div>
                <label className="block mb-1 font-medium">Duration (min)</label>
                <input
                    name="duration"
                    type="number"
                    value={form.duration}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full"
                    min={10}
                    max={240}
                    required
                />
                {errors.duration && (
                    <div className="text-red-500 text-sm mt-1">{errors.duration}</div>
                )}
            </div>
            <div>
                <label className="block mb-1 font-medium">Price (BRL)</label>
                <input
                    name="priceCents"
                    type="number"
                    value={form.priceCents}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full"
                    min={0}
                    step={100}
                    required
                />
                <div className="text-xs text-gray-400">
                    * Enter the value in cents. Example: R$100,00 = 10000
                </div>
                {errors.priceCents && (
                    <div className="text-red-500 text-sm mt-1">{errors.priceCents}</div>
                )}
            </div>
            <div className="flex items-center">
                <input
                    name="online"
                    type="checkbox"
                    checked={form.online}
                    onChange={handleChange}
                    className="mr-2"
                />
                <label className="font-medium">Available for online sessions?</label>
            </div>
            {errors.general && (
                <div className="text-red-500 text-sm mt-1">{errors.general}</div>
            )}
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
            >
                {loading ? "Saving..." : "Add Service"}
            </button>
        </form>
    );
}
