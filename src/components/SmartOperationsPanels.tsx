"use client";

import React, { useState } from "react";
import {
  Camera,
  Car,
  Check,
  Clock,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Video,
  Wrench,
  X,
} from "lucide-react";

interface SmartOperationsProps {
  activeTab: "parking" | "delivery";
  isAr: boolean;
  cityFilter: string;
  apiBase: string;
  adminFetch: (url: string, options?: RequestInit) => Promise<Response>;
  parkingConfigs: any[];
  parkingReservations: any[];
  catalogProducts: any[];
  ecommerceOrders: any[];
  deliveryBatches: any[];
  vehicleSpecs: any;
  onRefresh: () => Promise<void>;
  setActionBanner: (msg: string | null) => void;
}

export function SmartOperationsPanels({
  activeTab,
  isAr,
  cityFilter,
  apiBase,
  adminFetch,
  parkingConfigs,
  parkingReservations,
  catalogProducts,
  ecommerceOrders,
  deliveryBatches,
  vehicleSpecs,
  onRefresh,
  setActionBanner,
}: SmartOperationsProps) {
  const [selectedParkingId, setSelectedParkingId] = useState<string>(
    parkingConfigs[0]?.placeId || "place-parking-yas-mall-abudhabi",
  );
  const [syncingCameraId, setSyncingCameraId] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [dispatchingBatchId, setDispatchingBatchId] = useState<string | null>(
    null,
  );
  const [expandedManifestBatchId, setExpandedManifestBatchId] = useState<
    string | null
  >(null);

  // Add Product Form State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    placeId: "place-yas-mall-hypermarket-abudhabi",
    placeNameEn: "Yas Island Gourmet Market & Groceries",
    placeNameAr: "سوبرماركت وأسواق جزيرة ياس",
    merchantType: "MARKET" as "RESTAURANT" | "MARKET" | "PHARMACY" | "CAFE",
    cityId: "abudhabi",
    nameEn: "",
    nameAr: "",
    categoryTag: "GROCERIES" as
      | "MEALS"
      | "GROCERIES"
      | "PHARMACY"
      | "BEVERAGES"
      | "BAKERY",
    price: "65",
    lengthCm: "32",
    widthCm: "24",
    heightCm: "18",
    weightKg: "2.5",
    handlingFlags: ["STANDARD"] as string[],
  });

  const filteredParking = parkingConfigs.filter((c) =>
    cityFilter === "ALL" ? true : c.cityId === cityFilter,
  );
  const activeParking =
    filteredParking.find((c) => c.placeId === selectedParkingId) ||
    filteredParking[0] ||
    parkingConfigs[0];

  const handleToggleParkingMode = async (
    placeId: string,
    nextMode: "MANUAL" | "CAMERA_AI",
  ) => {
    const res = await adminFetch(
      `${apiBase}/parking/admin/${placeId}/config`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managementMode: nextMode }),
      },
    ).then((r) => r.json());

    if (res?.success) {
      setActionBanner(
        isAr
          ? `تم تغيير وضع إدارة المواقف إلى ${nextMode === "CAMERA_AI" ? "كاميرا الذكاء الاصطناعي التلقائية (CAMERA_AI)" : "الإدارة اليدوية (MANUAL)"}.`
          : `Switched parking area to ${nextMode === "CAMERA_AI" ? "Automated Camera AI Detection (CAMERA_AI)" : "Manual Slot Management (MANUAL)"}.`,
      );
      await onRefresh();
    }
  };

  const handleRunCameraSync = async (placeId: string) => {
    setSyncingCameraId(placeId);
    try {
      const res = await adminFetch(
        `${apiBase}/parking/admin/${placeId}/camera-sync`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      ).then((r) => r.json());

      if (res?.success) {
        setActionBanner(
          isAr
            ? `تم فحص كاميرا المواقف بالذكاء الاصطناعي: متاح الآن ${res.stats.availableSlotsCount}/${res.stats.totalSlots} موقفاً (تمت حماية ${res.stats.protectedReservedCount} حجزاً نشطاً).`
            : `Camera AI Slot Detection complete: ${res.stats.availableSlotsCount}/${res.stats.totalSlots} available (${res.stats.protectedReservedCount} active reservations protected).`,
        );
        await onRefresh();
      }
    } finally {
      setSyncingCameraId(null);
    }
  };

  const handleUpdateSlotManual = async (
    placeId: string,
    slotId: string,
    nextStatus: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE",
  ) => {
    await adminFetch(`${apiBase}/parking/admin/${placeId}/slots/${slotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setActionBanner(
      isAr
        ? `تم تحديث حالة الموقف ${slotId} يدوياً إلى ${nextStatus}.`
        : `Updated slot ${slotId} status to ${nextStatus}.`,
    );
    await onRefresh();
  };

  const handleAddParkingSlot = async (placeId: string) => {
    const res = await adminFetch(`${apiBase}/parking/admin/${placeId}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zone: "Zone B - Level 1", type: "STANDARD" }),
    }).then((r) => r.json());
    if (res?.slot) {
      setActionBanner(
        isAr
          ? `تمت إضافة موقف جديد برقم ${res.slot.slotId}.`
          : `Added new parking slot ${res.slot.slotId}.`,
      );
      await onRefresh();
    }
  };

  const handleReservationAction = async (
    reservationId: string,
    action: "check-in" | "cancel",
  ) => {
    await adminFetch(
      `${apiBase}/parking/reservations/${reservationId}/${action}`,
      { method: "POST" },
    );
    setActionBanner(
      action === "check-in"
        ? isAr
          ? "تم تسجيل وصول المركبة وتأكيد إشغال الموقف."
          : "Vehicle checked in; slot transitioned from RESERVED to OCCUPIED."
        : isAr
          ? "تم إلغاء الحجز وإتاحة الموقف مجدداً."
          : "Reservation cancelled; slot released back to AVAILABLE.",
    );
    await onRefresh();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await adminFetch(`${apiBase}/commerce/catalog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProd,
        price: Number(newProd.price) || 45,
        lengthCm: Number(newProd.lengthCm) || 25,
        widthCm: Number(newProd.widthCm) || 20,
        heightCm: Number(newProd.heightCm) || 15,
        weightKg: Number(newProd.weightKg) || 1.5,
      }),
    }).then((r) => r.json());

    if (res?.product) {
      setActionBanner(
        isAr
          ? `تمت إضافة المنتج "${res.product.nameAr}" بأبعاد (${res.product.dimensionsCm.length}×${res.product.dimensionsCm.width}×${res.product.dimensionsCm.height} سم).`
          : `Added catalog product '${res.product.nameEn}' (${res.product.dimensionsCm.length}×${res.product.dimensionsCm.width}×${res.product.dimensionsCm.height} cm, ${res.product.weightKg} kg).`,
      );
      setShowAddProduct(false);
      await onRefresh();
    }
  };

  const handleOrderStateChange = async (orderId: string, nextState: string) => {
    await adminFetch(`${apiBase}/commerce/orders/${orderId}/state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: nextState }),
    });
    setActionBanner(
      isAr
        ? `تم تحديث حالة الطلب إلى ${nextState}.`
        : `Transitioned order state to ${nextState}.`,
    );
    await onRefresh();
  };

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    try {
      const res = await adminFetch(`${apiBase}/commerce/delivery/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: cityFilter }),
      }).then((r) => r.json());

      setActionBanner(
        isAr
          ? `اكتمل تحسين التوصيل ثلاثي الأبعاد: تم تجميع ${res?.optimizedOrdersCount || 0} طلبات في ${res?.createdBatchesCount || 0} رحلات توصيل مثالية.`
          : `3D Delivery Optimization complete: grouped ${res?.optimizedOrdersCount || 0} orders into ${res?.createdBatchesCount || 0} optimized vehicle ride batch(es).`,
      );
      await onRefresh();
    } finally {
      setOptimizing(false);
    }
  };

  const handleDispatchTalabat = async (rideBatchId: string) => {
    setDispatchingBatchId(rideBatchId);
    try {
      const res = await adminFetch(
        `${apiBase}/commerce/delivery/batches/${rideBatchId}/dispatch-talabat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerName: "TALABAT" }),
        },
      ).then((r) => r.json());

      if (res?.success) {
        setActionBanner(
          isAr
            ? `تم إرسال دفعة التوصيل إلى Talabat بنجاح! رقم التتبع الخارجي: ${res.externalTrackingCode}`
            : `Dispatched ride batch to Talabat 3PL! External Tracking ID: ${res.externalTrackingCode}`,
        );
        await onRefresh();
      }
    } finally {
      setDispatchingBatchId(null);
    }
  };

  // ===========================================================================
  // TAB 7: SMART PARKING MONITORING, CAMERA AI vs MANUAL & RESERVATIONS
  // ===========================================================================
  if (activeTab === "parking") {
    return (
      <div className="space-y-6">
        {/* Top Selector of Parking Areas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0072DC]/10 px-3 py-1 text-[11px] font-extrabold text-[#0072DC]">
                <Camera className="h-3.5 w-3.5" />
                {isAr
                  ? "نظام مراقبة وحجز المواقف الذكي (كاميرا AI أو يدوي)"
                  : "SMART PARKING RESERVATION & CAMERA AI VISION CONTROL"}
              </span>
              <h2 className="mt-2 text-lg font-extrabold text-[#072549]">
                {isAr
                  ? "إدارة ساحات المواقف، الكاميرات الحية، وحجوزات المستخدمين"
                  : "Parking Areas, Camera AI Slot Detection & Reservations"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {isAr
                  ? "اختر ساحة المواقف للتبديل بين التحديث اليدوي للمواقف أو الاعتماد التلقائي على كاميرا المراقبة وخدمة اكتشاف المركبات."
                  : "Switch each parking area between Manual Slot Editing and Automated Camera AI Vehicle/Slot Detection Service."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredParking.map((cfg) => {
                const selected = activeParking?.placeId === cfg.placeId;
                return (
                  <button
                    key={cfg.placeId}
                    onClick={() => setSelectedParkingId(cfg.placeId)}
                    className={`rounded-xl border px-3.5 py-2 text-left text-xs font-extrabold transition ${
                      selected
                        ? "border-[#072549] bg-[#072549] text-white shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div>{isAr ? cfg.placeNameAr : cfg.placeNameEn}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] opacity-85">
                      <span>
                        {cfg.availableSlotsCount}/{cfg.totalSlots}{" "}
                        {isAr ? "متاح" : "free"}
                      </span>
                      <span>•</span>
                      <span
                        className={
                          cfg.managementMode === "CAMERA_AI"
                            ? "text-[#00D2B4]"
                            : "text-amber-400"
                        }
                      >
                        {cfg.managementMode}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {activeParking && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 5 Cols: Mode Switcher + Camera Feed & AI Service Settings */}
            <div className="space-y-5 lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#072549]">
                    <Settings2 className="h-4 w-4 text-[#0072DC]" />
                    {isAr
                      ? "وضع إدارة ومراقبة المواقف"
                      : "Slot Monitoring & Management Mode"}
                  </h3>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                      activeParking.managementMode === "CAMERA_AI"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {activeParking.managementMode === "CAMERA_AI"
                      ? isAr
                        ? "كاميرا الذكاء الاصطناعي نشطة"
                        : "CAMERA AI DETECTION ACTIVE"
                      : isAr
                        ? "إدارة يدوية"
                        : "MANUAL MANAGEMENT"}
                  </span>
                </div>

                {/* Mode Switch Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-100 p-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleParkingMode(
                        activeParking.placeId,
                        "CAMERA_AI",
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition ${
                      activeParking.managementMode === "CAMERA_AI"
                        ? "bg-[#0072DC] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    <span>
                      {isAr
                        ? "خدمة كاميرا الذكاء الاصطناعي"
                        : "Camera AI Detection"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleParkingMode(activeParking.placeId, "MANUAL")
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition ${
                      activeParking.managementMode === "MANUAL"
                        ? "bg-[#072549] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Wrench className="h-4 w-4" />
                    <span>
                      {isAr ? "إدارة وتحرير يدوي" : "Manual Slot Edit"}
                    </span>
                  </button>
                </div>

                {/* Live Camera Feed & Vision Endpoint Card */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white">
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={activeParking.cameraSnapshotUrl}
                      alt={activeParking.placeNameEn}
                      className="h-full w-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-slate-950/80 px-2.5 py-1 text-[10px] font-extrabold">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          activeParking.managementMode === "CAMERA_AI"
                            ? "animate-pulse bg-emerald-400"
                            : "bg-amber-400"
                        }`}
                      />
                      <span>
                        {activeParking.managementMode === "CAMERA_AI"
                          ? "LIVE RTSP VISION STREAM"
                          : "CAMERA PAUSED (MANUAL OVERRIDE)"}
                      </span>
                    </div>
                    <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-extrabold">
                          {isAr
                            ? activeParking.placeNameAr
                            : activeParking.placeNameEn}
                        </p>
                        <p className="font-mono text-[10px] text-sky-300">
                          {activeParking.cameraFeedUrl}
                        </p>
                      </div>
                      <span className="rounded bg-[#00B89C] px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                        {activeParking.hourlyRate} {activeParking.currency}/hr
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 text-[11px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>AI Vision Provider:</span>
                      <span className="font-bold text-white">
                        {activeParking.aiDetectionProvider}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Reservation Grace Lock:</span>
                      <span className="font-bold text-[#00D2B4]">
                        {activeParking.gracePeriodMinutes} mins (Protected from
                        override)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Last Camera Detection Sync:</span>
                      <span className="font-mono text-slate-200">
                        {String(activeParking.lastCameraSyncAt)
                          .slice(11, 19)}
                      </span>
                    </div>

                    {activeParking.managementMode === "CAMERA_AI" && (
                      <button
                        type="button"
                        disabled={syncingCameraId === activeParking.placeId}
                        onClick={() =>
                          handleRunCameraSync(activeParking.placeId)
                        }
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00B89C] px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-[#00D2B4] disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${
                            syncingCameraId === activeParking.placeId
                              ? "animate-spin"
                              : ""
                          }`}
                        />
                        <span>
                          {isAr
                            ? "تشغيل مسح الكاميرا وتحديث المواقف المتاحة الآن"
                            : "Scan Camera Feed & Auto-Update Slots Now"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Reservations Queue */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <h3 className="text-sm font-extrabold text-[#072549]">
                  {isAr
                    ? "طلبات وحجوزات المواقف الحالية"
                    : "Active Parking Slot Reservations"}
                </h3>
                <div className="mt-3 space-y-2.5">
                  {parkingReservations.filter(
                    (r) => r.placeId === activeParking.placeId,
                  ).length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                      {isAr
                        ? "لا توجد حجوزات نشطة حالياً في هذه الساحة."
                        : "No reservations recorded for this parking area yet."}
                    </p>
                  ) : (
                    parkingReservations
                      .filter((r) => r.placeId === activeParking.placeId)
                      .slice(0, 6)
                      .map((res: any) => (
                        <div
                          key={res.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-[#072549] px-2 py-0.5 font-mono text-[10px] font-extrabold text-white">
                                {res.slotId}
                              </span>
                              <span className="font-extrabold text-[#072549]">
                                {res.userName}
                              </span>
                              <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-900">
                                {res.vehiclePlate}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                              Status: <strong>{res.status}</strong> • Fee:{" "}
                              {res.totalFee} {res.currency} ({res.durationHours}
                              h)
                            </p>
                          </div>

                          {res.status === "RESERVED" && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleReservationAction(res.id, "check-in")
                                }
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-emerald-700"
                              >
                                {isAr ? "تأكيد الوصول" : "Check-In"}
                              </button>
                              <button
                                onClick={() =>
                                  handleReservationAction(res.id, "cancel")
                                }
                                className="rounded-lg bg-rose-100 px-2.5 py-1 text-[10px] font-extrabold text-rose-700 hover:bg-rose-200"
                              >
                                {isAr ? "إلغاء" : "Cancel"}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Live Interactive Slot Map & Manual Controls */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#072549]">
                    {isAr
                      ? `خريطة المواقف الحية (${activeParking.placeNameAr}) — الإجمالي: ${activeParking.totalSlots}`
                      : `Live Slot Grid (${activeParking.placeNameEn}) — Total: ${activeParking.totalSlots} Slots`}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {activeParking.managementMode === "MANUAL"
                      ? isAr
                        ? "الوضع اليدوي مفعّل: اضغط على أي زر حالة داخل الموقف لتعديله يدوياً."
                        : "Manual Mode Active: Click any status pill inside a slot card to change its availability."
                      : isAr
                        ? "وضع كاميرا الذكاء الاصطناعي مفعّل: يتم تحديث المواقف تلقائياً من الكاميرا مع إمكانية التدخل اليدوي."
                        : "Camera AI Mode Active: Slots update automatically from camera detection (admin override available)."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddParkingSlot(activeParking.placeId)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#072549] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#0072DC]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isAr ? "+ إضافة موقف" : "+ Add Slot"}</span>
                </button>
              </div>

              {/* KPI Summary Strip */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
                  <p className="text-[11px] font-bold text-emerald-800">
                    {isAr ? "مواقف متاحة (AVAILABLE)" : "Available Slots"}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                    {activeParking.availableSlotsCount}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-center">
                  <p className="text-[11px] font-bold text-amber-800">
                    {isAr ? "مواقف محجوزة (RESERVED)" : "Reserved (15m Lock)"}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-amber-700">
                    {activeParking.reservedSlotsCount}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-center">
                  <p className="text-[11px] font-bold text-rose-800">
                    {isAr ? "مواقف مشغولة (OCCUPIED)" : "Occupied Slots"}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-rose-700">
                    {activeParking.occupiedSlotsCount}
                  </p>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeParking.slots?.map((slot: any) => {
                  const isAvail = slot.status === "AVAILABLE";
                  const isRes = slot.status === "RESERVED";
                  const isOcc = slot.status === "OCCUPIED";

                  return (
                    <div
                      key={slot.slotId}
                      className={`rounded-2xl border-2 p-3.5 transition ${
                        isAvail
                          ? "border-emerald-300 bg-emerald-50/40"
                          : isRes
                            ? "border-amber-400 bg-amber-50/60"
                            : "border-rose-300 bg-rose-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-[#072549] px-2.5 py-1 font-mono text-xs font-extrabold text-white">
                          #{slot.slotNumber} • {slot.slotId}
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-600 shadow-2xs">
                          {slot.type}
                        </span>
                      </div>

                      <p className="mt-1.5 text-[11px] font-semibold text-slate-500">
                        {slot.zone}
                      </p>

                      <div className="mt-2 min-h-[34px] text-[11px]">
                        {isAvail && (
                          <span className="font-extrabold text-emerald-700">
                            ✓ {isAr ? "متاح للحجز الفوري" : "Ready for Reservation"}
                          </span>
                        )}
                        {isRes && (
                          <div className="text-amber-900">
                            <p className="font-extrabold">
                              🔒 {slot.reservedByUserName || "Reserved"} (
                              {slot.reservedVehiclePlate})
                            </p>
                            <p className="text-[10px] text-amber-700">
                              Grace lock until{" "}
                              {String(slot.graceExpiresAt).slice(11, 16)}
                            </p>
                          </div>
                        )}
                        {isOcc && (
                          <div className="text-rose-900">
                            <p className="font-extrabold">
                              🚗 Plate: {slot.detectedPlateNumber || "OCCUPIED"}
                            </p>
                            {slot.confidenceScore && (
                              <p className="text-[10px] text-rose-700">
                                AI Confidence:{" "}
                                {Math.round(slot.confidenceScore * 100)}%
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Manual / Admin Slot Status Controls */}
                      <div className="mt-3 flex items-center gap-1 border-t border-slate-200/70 pt-2.5">
                        {(["AVAILABLE", "RESERVED", "OCCUPIED"] as const).map(
                          (st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() =>
                                handleUpdateSlotManual(
                                  activeParking.placeId,
                                  slot.slotId,
                                  st,
                                )
                              }
                              className={`flex-1 rounded-lg py-1 text-[9px] font-extrabold transition ${
                                slot.status === st
                                  ? st === "AVAILABLE"
                                    ? "bg-emerald-600 text-white"
                                    : st === "RESERVED"
                                      ? "bg-amber-600 text-white"
                                      : "bg-rose-600 text-white"
                                  : "bg-white text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {st.slice(0, 5)}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===========================================================================
  // TAB 8: E-COMMERCE, 3D VEHICLE OPTIMIZER & TALABAT 3PL DISPATCH
  // ===========================================================================
  const motoSpec = vehicleSpecs?.MOTORCYCLE || {
    innerDimensionsCm: { length: 45, width: 45, height: 45 },
    usableVolumeCm3: 72900,
    maxWeightKg: 18,
  };
  const carSpec = vehicleSpecs?.CAR || {
    innerDimensionsCm: { length: 100, width: 95, height: 50 },
    usableVolumeCm3: 389500,
    maxWeightKg: 120,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner + 3D Vehicle Box/Trunk Specs + Run Optimizer Button */}
      <div className="rounded-2xl bg-gradient-to-r from-[#072549] via-[#0A2E5C] to-[#0072DC] p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-[#00D2B4] px-3 py-0.5 text-[10px] font-extrabold text-[#072549]">
              {isAr
                ? "محرك تحسين التوصيل ثلاثي الأبعاد والربط مع Talabat"
                : "3D BIN-PACKING DELIVERY OPTIMIZER & TALABAT 3PL DISPATCH"}
            </span>
            <h2 className="mt-2 text-xl font-extrabold">
              {isAr
                ? "مطابقة أبعاد الطلبات مع صندوق الدراجة النارية وصندوق السيارة وتجميع الرحلات"
                : "Order 3D Dimension Matching (Motorcycle Box vs. Car Trunk) & Multi-Order Ride Batching"}
            </h2>
            <p className="mt-1 text-xs text-sky-100">
              {isAr
                ? "يقوم النظام بحساب الطول × العرض × الارتفاع والوزن لكل منتج لتحديد ما إذا كانت دراجة نارية واحدة أو سيارة واحدة تكفي لطلب أو عدة طلبات متقاربة قبل إرسالها إلى Talabat."
                : "Automatically matches item L×W×H (cm), weight (kg), and upright/fragile constraints against vehicle containers before dispatching to Talabat."}
            </p>
          </div>

          <button
            type="button"
            disabled={optimizing}
            onClick={handleRunOptimizer}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00B89C] px-5 py-3 text-xs font-extrabold text-slate-950 shadow-lg transition hover:bg-[#00D2B4] disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {optimizing
                ? isAr
                  ? "جاري حساب الأبعاد وتجميع الرحلات..."
                  : "Optimizing 3D Vehicle Rides..."
                : isAr
                  ? "تشغيل خوارزمية تحسين التوصيل الآن"
                  : "Run 3D Delivery Ride Optimizer"}
            </span>
          </button>
        </div>

        {/* Vehicle Container Dimension Specs Strip */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#00D2B4]">
                🏍️{" "}
                {isAr
                  ? "صندوق الدراجة النارية (Motorcycle Box)"
                  : "Motorcycle Delivery Top-Box"}
              </span>
              <span className="rounded bg-white/15 px-2.5 py-0.5 font-mono text-[11px] font-bold">
                {motoSpec.innerDimensionsCm.length} ×{" "}
                {motoSpec.innerDimensionsCm.width} ×{" "}
                {motoSpec.innerDimensionsCm.height} cm
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-sky-100">
              Usable Volume:{" "}
              <strong>{motoSpec.usableVolumeCm3.toLocaleString()} cm³</strong> •
              Max Payload: <strong>{motoSpec.maxWeightKg} kg</strong> • Max
              Shared Orders: <strong>2 orders (≤ 5.5 km)</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#FF991F]">
                🚗{" "}
                {isAr
                  ? "صندوق السيارة الخلفي (Sedan Car Trunk)"
                  : "Delivery Sedan Car Trunk"}
              </span>
              <span className="rounded bg-white/15 px-2.5 py-0.5 font-mono text-[11px] font-bold">
                {carSpec.innerDimensionsCm.length} ×{" "}
                {carSpec.innerDimensionsCm.width} ×{" "}
                {carSpec.innerDimensionsCm.height} cm
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-sky-100">
              Usable Volume:{" "}
              <strong>{carSpec.usableVolumeCm3.toLocaleString()} cm³</strong> •
              Max Payload: <strong>{carSpec.maxWeightKg} kg</strong> • Max
              Shared Orders: <strong>4 orders (≤ 12 km)</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Optimized Ride Batches & Talabat 3PL Dispatch Queue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#072549]">
          <Truck className="h-4 w-4 text-[#0072DC]" />
          {isAr
            ? "دفعات التوصيل المحسّنة والجاهزة للإرسال إلى مزود التوصيل (Talabat 3PL)"
            : "Optimized Delivery Ride Batches & Talabat 3PL Dispatch Queue"}
        </h3>

        {deliveryBatches.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">
            {isAr
              ? "لا توجد دفعات توصيل بعد. قم بإنشاء طلب من تطبيق العميل ثم اضغط على (تشغيل خوارزمية تحسين التوصيل الآن)."
              : "No optimized ride batches yet. Place an order in the Customer App and click 'Run 3D Delivery Ride Optimizer' above."}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {deliveryBatches.map((batch: any) => (
              <div
                key={batch.rideBatchId}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-extrabold text-white ${
                          batch.vehicleType === "MOTORCYCLE"
                            ? "bg-[#0072DC]"
                            : "bg-[#072549]"
                        }`}
                      >
                        {batch.vehicleType === "MOTORCYCLE"
                          ? "🏍️ 1 MOTORCYCLE"
                          : "🚗 1 SEDAN CAR TRUNK"}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-[#072549]">
                        {batch.rideBatchId}
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        {batch.totalOrdersCount} Order(s):{" "}
                        {batch.orderNumbers?.join(", ")}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                          batch.providerDispatchStatus ===
                          "DISPATCHED_TO_TALABAT"
                            ? "bg-[#FF5A00] text-white"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {batch.providerDispatchStatus ===
                        "DISPATCHED_TO_TALABAT"
                          ? `TALABAT TRACKING: ${batch.externalTrackingCode}`
                          : "READY FOR TALABAT DISPATCH"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-bold text-slate-700">
                      {isAr
                        ? batch.dimensionFitAnalysis?.reasonAr
                        : batch.dimensionFitAnalysis?.reasonEn}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-600">
                      <span>
                        Box Volume:{" "}
                        <strong>
                          {batch.totalVolumeCm3?.toLocaleString()} cm³ (
                          {batch.volumeUtilizationPercent}% full)
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Weight:{" "}
                        <strong>
                          {batch.totalWeightKg} kg (
                          {batch.weightUtilizationPercent}% max)
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Route:{" "}
                        <strong>{batch.estimatedRouteDistanceKm} km</strong> (
                        {batch.merchantsVisited?.length} pickup(s) →{" "}
                        {batch.customerDropoffs?.length} drop-off(s))
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedManifestBatchId(
                          expandedManifestBatchId === batch.rideBatchId
                            ? null
                            : batch.rideBatchId,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      {expandedManifestBatchId === batch.rideBatchId
                        ? isAr
                          ? "إخفاء Payload"
                          : "Hide Manifest JSON"
                        : isAr
                          ? "عرض حمولة Talabat"
                          : "View Talabat Payload"}
                    </button>

                    {batch.providerDispatchStatus !==
                      "DISPATCHED_TO_TALABAT" && (
                      <button
                        type="button"
                        disabled={dispatchingBatchId === batch.rideBatchId}
                        onClick={() => handleDispatchTalabat(batch.rideBatchId)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5A00] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#e04f00] disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>
                          {isAr
                            ? "إرسال إلى Talabat للتوصيل"
                            : "Dispatch to Talabat"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {expandedManifestBatchId === batch.rideBatchId && (
                  <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-300">
                    {JSON.stringify(batch.talabatManifestPayload, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders State Machine Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h3 className="text-sm font-extrabold text-[#072549]">
          {isAr
            ? "الطلبات الحالية، الطلبات الفرعية للمتاجر، والتحكم بتغييرات الحالة (State Machine)"
            : "E-Commerce Orders, Multi-Merchant Sub-Orders & State Lifecycle Controls"}
        </h3>

        {ecommerceOrders.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">
            {isAr
              ? "لا توجد طلبات مسجلة حالياً."
              : "No e-commerce orders placed yet."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {ecommerceOrders.map((ord: any) => (
              <div
                key={ord.id}
                className="rounded-2xl border border-slate-200 p-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[#072549] px-2.5 py-0.5 font-mono font-extrabold text-white">
                        {ord.orderNumber}
                      </span>
                      <span className="font-extrabold text-[#072549]">
                        {ord.customerName} ({ord.customerPhone})
                      </span>
                      <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-900">
                        {ord.state}
                      </span>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                        Single-Order Fit: {ord.recommendedSingleOrderVehicle} (
                        {ord.totalVolumeCm3?.toLocaleString()} cm³,{" "}
                        {ord.totalWeightKg} kg)
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      Address: {ord.deliveryAddress} • Total:{" "}
                      <strong>
                        {ord.totalAmount} {ord.currency}
                      </strong>{" "}
                      ({ord.subOrders?.length} merchant sub-order(s))
                    </p>
                  </div>

                  <select
                    value={ord.state}
                    onChange={(e) =>
                      handleOrderStateChange(ord.id, e.target.value)
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-[#072549]"
                  >
                    <option value="CONFIRMED_TEST_MODE">
                      CONFIRMED_TEST_MODE
                    </option>
                    <option value="PREPARING_AT_MERCHANT">
                      PREPARING_AT_MERCHANT
                    </option>
                    <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                    <option value="OPTIMIZED_FOR_DISPATCH">
                      OPTIMIZED_FOR_DISPATCH
                    </option>
                    <option value="DISPATCHED_TO_PROVIDER">
                      DISPATCHED_TO_PROVIDER
                    </option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Merchant Catalog Products & 3D Dimensions Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#072549]">
              {isAr
                ? "كتالوج المنتجات (المطاعم، الأسواق، الصيدليات) مع الأبعاد ثلاثية الأبعاد والوزن"
                : "Merchant E-Commerce Catalog (with Item 3D Dimensions L×W×H cm & Weight)"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {isAr
                ? "تُستخدم هذه الأبعاد والوزن لمطابقة المنتجات مع سعة صندوق الدراجة النارية أو صندوق السيارة."
                : "Used by the delivery optimizer to match order items against Motorcycle Box (45×45×45 cm) and Car Trunk (100×95×50 cm)."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddProduct((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#072549] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#0072DC]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>
              {showAddProduct
                ? isAr
                  ? "إغلاق النموذج"
                  : "Close Form"
                : isAr
                  ? "+ إضافة منتج جديد للكتالوج"
                  : "+ Add Catalog Item"}
            </span>
          </button>
        </div>

        {showAddProduct && (
          <form
            onSubmit={handleCreateProduct}
            className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"
          >
            <input
              required
              placeholder="Product Name (EN)"
              value={newProd.nameEn}
              onChange={(e) =>
                setNewProd({ ...newProd, nameEn: e.target.value })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />
            <input
              placeholder="اسم المنتج (AR)"
              value={newProd.nameAr}
              onChange={(e) =>
                setNewProd({ ...newProd, nameAr: e.target.value })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />
            <select
              value={newProd.merchantType}
              onChange={(e) =>
                setNewProd({
                  ...newProd,
                  merchantType: e.target.value as any,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
            >
              <option value="MARKET">MARKET (Groceries)</option>
              <option value="RESTAURANT">RESTAURANT (Meals)</option>
              <option value="PHARMACY">PHARMACY (Health)</option>
              <option value="CAFE">CAFE (Beverages)</option>
            </select>

            <input
              type="number"
              placeholder="Length (cm)"
              value={newProd.lengthCm}
              onChange={(e) =>
                setNewProd({ ...newProd, lengthCm: e.target.value })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />
            <input
              type="number"
              placeholder="Width (cm)"
              value={newProd.widthCm}
              onChange={(e) =>
                setNewProd({ ...newProd, widthCm: e.target.value })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />
            <input
              type="number"
              placeholder="Height (cm)"
              value={newProd.heightCm}
              onChange={(e) =>
                setNewProd({ ...newProd, heightCm: e.target.value })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />

            <input
              type="number"
              step="0.1"
              placeholder="Weight (kg)"
              value={newProd.weightKg}
              onChange={(e) =>
                setNewProd({ ...newProd, weightKg: e.target.value })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />
            <input
              type="number"
              placeholder="Price"
              value={newProd.price}
              onChange={(e) =>
                setNewProd({ ...newProd, price: e.target.value })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#00B89C] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#072549]"
            >
              {isAr ? "حفظ المنتج" : "Save Product"}
            </button>
          </form>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400">
                <th className="pb-2">Product</th>
                <th className="pb-2">Store / Type</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">3D Dimensions (L×W×H)</th>
                <th className="pb-2">Weight</th>
                <th className="pb-2">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catalogProducts.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-2.5 font-extrabold text-[#072549]">
                    {isAr ? p.nameAr : p.nameEn}
                  </td>
                  <td className="py-2.5 text-slate-600">
                    {isAr ? p.placeNameAr : p.placeNameEn} ({p.merchantType})
                  </td>
                  <td className="py-2.5 font-bold text-[#0072DC]">
                    {p.price} {p.currency}
                  </td>
                  <td className="py-2.5 font-mono text-slate-700">
                    {p.dimensionsCm.length} × {p.dimensionsCm.width} ×{" "}
                    {p.dimensionsCm.height} cm
                  </td>
                  <td className="py-2.5 font-mono text-slate-700">
                    {p.weightKg} kg
                  </td>
                  <td className="py-2.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {p.handlingFlags?.join(", ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
