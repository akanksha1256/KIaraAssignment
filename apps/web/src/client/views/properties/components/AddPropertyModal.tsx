"use client";

import { useState, useRef, useEffect } from "react";
import { X as XIcon, Plus as PlusIcon } from "lucide-react";
import { useCreateProperty } from "@repo/data";
import { useToast, MutedText, StateTitle, CloseButton, LabeledTextField, Button } from "@repo/ui";
import { strings } from "@repo/tokens";

const sp = strings.manager.addProperty;
const spl = strings.manager.propertiesList;

let unitRowId = 1;

const unitInputCls =
  "h-10 w-full rounded-lg border border-sand-400 px-3 text-[13.5px] text-espresso-900 bg-white placeholder:text-espresso-500 focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors";

export const AddPropertyModal = ({ onClose }: { onClose: () => void }) => {
  const { showToast } = useToast();
  const createProperty = useCreateProperty();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [addressErr, setAddressErr] = useState("");
  const [unitRows, setUnitRows] = useState<{ id: number; label: string }[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addUnit = () => setUnitRows((r) => [...r, { id: unitRowId++, label: "" }]);
  const removeUnit = (id: number) => setUnitRows((r) => r.filter((u) => u.id !== id));
  const setUnitLabel = (id: number, label: string) =>
    setUnitRows((r) => r.map((u) => (u.id === id ? { ...u, label } : u)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!name.trim()) {
      setNameErr("Required");
      valid = false;
    }
    if (!address.trim()) {
      setAddressErr("Required");
      valid = false;
    }
    if (!valid) return;

    createProperty.mutate(
      {
        name: name.trim(),
        address: address.trim(),
        units: unitRows.map((u) => u.label.trim()).filter(Boolean),
      },
      {
        onSuccess: (property) => {
          showToast(sp.successToast(property.name), "success");
          onClose();
        },
        onError: (err) =>
          showToast((err as Error).message ?? spl.unitMenu.failedAddProperty, "error"),
      },
    );
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-[500px] mx-4 bg-white rounded-2xl shadow-2xl border border-sand-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-sand-200 flex-none">
          <div>
            <StateTitle className="text-maroon-600">{sp.title}</StateTitle>
            <MutedText className="mt-0.5">{sp.subtitle}</MutedText>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        {/* Body */}
        <form
          id="add-property-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-5 flex-1 space-y-4"
        >
          <LabeledTextField
            id="prop-name"
            label={sp.fieldName}
            value={name}
            onChange={(v) => {
              setName(v);
              setNameErr("");
            }}
            placeholder={sp.fieldNamePlaceholder}
            error={nameErr}
            disabled={createProperty.isPending}
          />

          <LabeledTextField
            id="prop-address"
            label={sp.fieldAddress}
            value={address}
            onChange={(v) => {
              setAddress(v);
              setAddressErr("");
            }}
            placeholder={sp.fieldAddressPlaceholder}
            error={addressErr}
            disabled={createProperty.isPending}
          />

          {/* Units */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {spl.addPropertyModal.unitsLabel}{" "}
                {unitRows.length > 0 && (
                  <span className="normal-case font-normal">· {unitRows.length}</span>
                )}
              </p>
              <button
                type="button"
                onClick={addUnit}
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-coral-500 hover:text-coral-600 transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" /> {spl.addPropertyModal.addUnit}
              </button>
            </div>

            {unitRows.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground italic">
                {spl.addPropertyModal.noUnitsHint}
              </p>
            ) : (
              <div className="space-y-2">
                {unitRows.map((row, i) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <span className="text-[12px] text-muted-foreground w-5 text-right flex-none">
                      {i + 1}.
                    </span>
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => setUnitLabel(row.id, e.target.value)}
                      placeholder={spl.addPropertyModal.unitPlaceholder(i + 1)}
                      className={unitInputCls}
                      disabled={createProperty.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => removeUnit(row.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-none"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-sand-200 flex-none">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={createProperty.isPending}
          >
            {sp.cancel}
          </Button>
          <Button
            size="sm"
            type="submit"
            form="add-property-form"
            disabled={createProperty.isPending}
          >
            {createProperty.isPending ? sp.submitting : sp.submit}
          </Button>
        </div>
      </div>
    </div>
  );
};
