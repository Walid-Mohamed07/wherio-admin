"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Database,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Globe,
  Sparkles,
  Users,
  FileCheck2,
  AlertTriangle,
  EyeOff,
  Check,
  History,
  HardDriveDownload,
  Ban,
  Menu,
  X,
  ChevronDown,
  LogOut,
  UserPlus,
  UserCheck,
  KeyRound,
  Camera,
  Truck,
} from "lucide-react";
import {
  ADMIN_API_BASE,
  AdminUserProfile,
  clearAdminSession,
  getStoredAdminKey,
  getStoredAdminToken,
  getStoredAdminUser,
  saveAdminSession,
} from "@/lib/admin-auth";
import { SmartOperationsPanels } from "@/components/SmartOperationsPanels";

const API_BASE = ADMIN_API_BASE;

type AdminTab =
  | "overview"
  | "places"
  | "cities"
  | "reviews"
  | "users"
  | "audit"
  | "parking"
  | "delivery";

export default function WherioAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isAr = lang === "ar";

  // Auth & Route Protection State
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUserProfile | null>(null);

  // Responsive Sidebar Drawer & Header Avatar Menu State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Add New User Form State (Tab 5: Users & Roles)
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    phone: "+97150",
    countryCode: "AE" as "AE" | "SA" | "EG",
    role: "CONTENT_EDITOR" as
      | "SUPER_ADMIN"
      | "CONTENT_EDITOR"
      | "MODERATOR"
      | "MERCHANT_ADMIN"
      | "CUSTOMER",
    password: "",
    isPhoneVerified: true,
    isEmailVerified: true,
  });

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [parkingConfigs, setParkingConfigs] = useState<any[]>([]);
  const [parkingReservations, setParkingReservations] = useState<any[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [ecommerceOrders, setEcommerceOrders] = useState<any[]>([]);
  const [deliveryBatches, setDeliveryBatches] = useState<any[]>([]);
  const [vehicleSpecs, setVehicleSpecs] = useState<any | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [adminKeyInput, setAdminKeyInput] = useState<string>(
    process.env.NEXT_PUBLIC_ADMIN_API_KEY ||
      process.env.ADMIN_API_KEY ||
      "dev-wherio-admin-key-2026",
  );
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const getActiveAdminKey = (overrideKey?: string): string => {
    if (overrideKey !== undefined) return overrideKey.trim();
    return (
      getStoredAdminKey() ||
      adminKeyInput ||
      "dev-wherio-admin-key-2026"
    ).trim();
  };

  const adminFetch = async (
    url: string,
    options: RequestInit = {},
    overrideKey?: string,
  ) => {
    const key = getActiveAdminKey(overrideKey);
    const token = getStoredAdminToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      ...(key ? { "x-admin-key": key } : {}),
      ...(token ? { "x-admin-token": token, Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(url, { ...options, headers });
  };

  // Manual Place Creation Form State
  const [newPlace, setNewPlace] = useState({
    countryCode: "AE" as "AE" | "SA" | "EG",
    cityId: "abudhabi",
    areaId: "yas-island",
    categoryId: "cat-restaurants",
    nameEn: "",
    nameAr: "",
    neighborhoodEn: "Yas Island",
    neighborhoodAr: "جزيرة ياس",
    latitude: "24.4950",
    longitude: "54.6050",
    phone: "+97125551234",
    priceRange: "MODERATE" as "BUDGET" | "MODERATE" | "UPSCALE" | "UNKNOWN",
    entryFeeStatus: "FREE" as "FREE" | "PAID" | "UNKNOWN",
    parking: "AVAILABLE" as "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN",
    valetParking: "UNKNOWN" as "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN",
    kidsFriendly: "AVAILABLE" as "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN",
    outdoorSeating: "UNKNOWN" as "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN",
    wheelchairAccessible: "AVAILABLE" as
      | "AVAILABLE"
      | "NOT_AVAILABLE"
      | "UNKNOWN",
    wifi: "AVAILABLE" as "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN",
  });

  const loadAdminData = async (overrideKey?: string) => {
    setLoading(true);
    setAdminAuthError(null);
    try {
      const [
        ovHttp,
        plHttp,
        rvHttp,
        usHttp,
        auHttp,
        pkHttp,
        pkResHttp,
        catHttp,
        ordHttp,
        batHttp,
      ] = await Promise.all([
        adminFetch(`${API_BASE}/admin/overview`, {}, overrideKey),
        adminFetch(`${API_BASE}/admin/places`, {}, overrideKey),
        adminFetch(`${API_BASE}/admin/reviews`, {}, overrideKey),
        adminFetch(`${API_BASE}/admin/users`, {}, overrideKey),
        adminFetch(`${API_BASE}/admin/audit-logs`, {}, overrideKey),
        adminFetch(`${API_BASE}/parking/places`, {}, overrideKey),
        adminFetch(`${API_BASE}/parking/reservations`, {}, overrideKey),
        adminFetch(`${API_BASE}/commerce/catalog`, {}, overrideKey),
        adminFetch(`${API_BASE}/commerce/orders`, {}, overrideKey),
        adminFetch(`${API_BASE}/commerce/delivery/batches`, {}, overrideKey),
      ]);

      const ovRes = await ovHttp.json();
      if (!ovHttp.ok || !ovRes?.kpis) {
        setOverview(null);
        setAdminAuthError(
          ovRes?.messageEn ||
            "Admin access key (ADMIN_API_KEY) is required by the backend server.",
        );
        return;
      }

      const [
        plRes,
        rvRes,
        usRes,
        auRes,
        pkRes,
        pkReservationsRes,
        catRes,
        ordRes,
        batRes,
      ] = await Promise.all([
        plHttp.json(),
        rvHttp.json(),
        usHttp.json(),
        auHttp.json(),
        pkHttp.json().catch(() => []),
        pkResHttp.json().catch(() => []),
        catHttp.json().catch(() => []),
        ordHttp.json().catch(() => []),
        batHttp.json().catch(() => ({})),
      ]);

      setOverview(ovRes);
      setPlaces(Array.isArray(plRes) ? plRes : []);
      setReviews(Array.isArray(rvRes) ? rvRes : []);
      setUsers(Array.isArray(usRes) ? usRes : []);
      setAuditLogs(Array.isArray(auRes) ? auRes : []);
      setParkingConfigs(Array.isArray(pkRes) ? pkRes : []);
      setParkingReservations(
        Array.isArray(pkReservationsRes) ? pkReservationsRes : [],
      );
      setCatalogProducts(Array.isArray(catRes) ? catRes : []);
      setEcommerceOrders(Array.isArray(ordRes) ? ordRes : []);
      setDeliveryBatches(
        Array.isArray(batRes?.batches) ? batRes.batches : [],
      );
      if (batRes?.vehicleSpecs) setVehicleSpecs(batRes.vehicleSpecs);
    } catch (err) {
      console.error("Failed to fetch Wherio Admin API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyAndLoad = async () => {
      const token = getStoredAdminToken();
      const cachedUser = getStoredAdminUser();
      const savedKey = getStoredAdminKey();
      if (savedKey) setAdminKeyInput(savedKey);

      if (!token) {
        clearAdminSession();
        router.replace("/login");
        return;
      }

      if (cachedUser) {
        setAdminUser(cachedUser);
      }

      try {
        const res = await fetch(`${API_BASE}/admin/auth/me`, {
          headers: {
            "x-admin-token": token,
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          clearAdminSession();
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (data?.user) {
          setAdminUser(data.user);
          saveAdminSession(token, data.user);
        }
        setAuthChecking(false);
        await loadAdminData();
      } catch {
        // If offline or server unreachable but cachedUser exists, allow viewing cached shell
        if (cachedUser) {
          setAuthChecking(false);
          await loadAdminData();
        } else {
          clearAdminSession();
          router.replace("/login");
        }
      }
    };

    verifyAndLoad();
  }, [router]);

  // Collapse avatar menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await adminFetch(`${API_BASE}/admin/auth/logout`, { method: "POST" });
    } catch {
      // Ignore network error on logout
    }
    clearAdminSession();
    router.replace("/login");
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUserForm,
          actorName: adminUser?.name || "Wherio Super Admin",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.user) {
        setActionBanner(
          (isAr ? data?.messageAr : data?.messageEn) ||
            (isAr
              ? "تعذر إنشاء المستخدم. تأكد من عدم تكرار البريد أو الهاتف."
              : "Could not create user. Check that email and phone are unique."),
        );
        setAddingUser(false);
        return;
      }
      setActionBanner(
        isAr
          ? `تمت إضافة المستخدم "${data.user.name}" (${data.user.role}) بنجاح.`
          : `Added new user '${data.user.name}' (${data.user.role}) successfully.`,
      );
      setNewUserForm({
        name: "",
        email: "",
        phone: "+97150",
        countryCode: "AE",
        role: "CONTENT_EDITOR",
        password: "",
        isPhoneVerified: true,
        isEmailVerified: true,
      });
      setShowAddUserForm(false);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingUser(false);
    }
  };

  const handleGenerate100LaunchPlaces = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(
        `${API_BASE}/admin/places/generate-launch-batch`,
        {
          method: "POST",
        },
      ).then((r) => r.json());
      setActionBanner(
        isAr
          ? `تم استكمال دليل الإطلاق بنجاح! تمت إضافة ${res.addedCount} مكاناً ليصبح الإجمالي ${res.totalPlaces} مكاناً (٥٠ أبوظبي + ٥٠ الرياض).`
          : `Phase 1 Launch Batch Complete! Added ${res.addedCount} structured places (Total directory: ${res.totalPlaces} places across Abu Dhabi & Riyadh).`,
      );
      await loadAdminData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleClearDemoData = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/places/clear-demo-data`, {
        method: "POST",
      }).then((r) => r.json());
      setActionBanner(
        isAr
          ? `تم مسح البيانات التجريبية بنجاح (${res.removedPlaces} مكاناً). قاعدة البيانات الآن نظيفة وجاهزة للإنتاج.`
          : `Cleared ${res.removedPlaces} demo places & ${res.removedReviews} reviews. Database is now clean for Production.`,
      );
      await loadAdminData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateManualPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlace.nameEn.trim()) return;
    const res = await adminFetch(`${API_BASE}/admin/places`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newPlace,
        latitude: Number(newPlace.latitude),
        longitude: Number(newPlace.longitude),
      }),
    }).then((r) => r.json());

    setActionBanner(
      res.isDuplicateWarning
        ? isAr
          ? `تنبيه تكرار (Duplicate Detected): تم حفظ "${newPlace.nameEn}" بحالة NEEDS_REVIEW ونسبة اكتمال ${res.completenessScore}%.`
          : `Duplicate Warning Flagged: Saved '${newPlace.nameEn}' with status NEEDS_REVIEW and ${res.completenessScore}% completeness score.`
        : isAr
          ? `تمت إضافة "${newPlace.nameEn}" بنسبة اكتمال بيانات ${res.completenessScore}%.`
          : `Published '${newPlace.nameEn}' with ${res.completenessScore}% data completeness score.`,
    );
    setNewPlace((prev) => ({ ...prev, nameEn: "", nameAr: "" }));
    await loadAdminData();
  };

  const handleUpdatePlaceWorkflow = async (
    placeId: string,
    workflowStatus?:
      | "DRAFT"
      | "PENDING_APPROVAL"
      | "PUBLISHED"
      | "NEEDS_REVIEW",
    operatingStatus?: "ACTIVE" | "TEMPORARILY_CLOSED" | "PERMANENTLY_CLOSED",
  ) => {
    await adminFetch(`${API_BASE}/admin/places/${placeId}/workflow`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowStatus, operatingStatus }),
    });
    setActionBanner(
      isAr
        ? "تم تحديث حالة اعتماد المكان وحالة التشغيل بنجاح."
        : "Place workflow & operating status updated.",
    );
    await loadAdminData();
  };

  const handleDeletePlace = async (placeId: string) => {
    await adminFetch(`${API_BASE}/admin/places/${placeId}`, {
      method: "DELETE",
    });
    await loadAdminData();
  };

  const handleToggleCityActive = async (cityId: string) => {
    await adminFetch(`${API_BASE}/admin/cities/${cityId}/toggle`, {
      method: "PATCH",
    });
    await loadAdminData();
  };

  const handleModerateReview = async (
    reviewId: string,
    status: "APPROVED" | "HIDDEN",
  ) => {
    await adminFetch(`${API_BASE}/admin/reviews/${reviewId}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadAdminData();
  };

  const handleDeleteReview = async (reviewId: string) => {
    await adminFetch(`${API_BASE}/admin/reviews/${reviewId}`, {
      method: "DELETE",
    });
    await loadAdminData();
  };

  const handleToggleUserSuspension = async (
    userId: string,
    currentlySuspended: boolean,
  ) => {
    await adminFetch(`${API_BASE}/admin/users/${userId}/suspend`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isSuspended: !currentlySuspended,
        reason: !currentlySuspended
          ? "Suspended by Wherio Governance Admin"
          : undefined,
      }),
    });
    setActionBanner(
      !currentlySuspended
        ? isAr
          ? "تم إيقاف الحساب مؤقتاً وتوثيق الإجراء في سجل الحوكمة."
          : "User account suspended and recorded in governance audit log."
        : isAr
          ? "تمت استعادة الحساب وتفعيله بنجاح."
          : "User account restored.",
    );
    await loadAdminData();
  };

  const handleTriggerDatabaseBackup = async () => {
    const res = await adminFetch(`${API_BASE}/admin/backup`, {
      method: "POST",
    }).then((r) => r.json());
    setActionBanner(
      isAr
        ? `تم إنشاء نسخة احتياطية فورية لقاعدة البيانات (${res.backupFile}) بتاريخ ${res.lastBackupAt}.`
        : `Database backup snapshot created (${res.backupFile}) at ${res.lastBackupAt}.`,
    );
    await loadAdminData();
  };

  const handleExportOperationsReport = async () => {
    try {
      const res = await adminFetch(`${API_BASE}/admin/reports/export`).then(
        (r) => r.json(),
      );
      if (typeof window !== "undefined" && res?.csvContent) {
        const blob = new Blob([res.csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          res.csvFilename || "wherio-operations-report.csv",
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      setActionBanner(
        isAr
          ? "تم تصدير وتحميل تقرير العمليات التشغيلي بنجاح (CSV)."
          : "Exported and downloaded Wherio Operations Report (CSV).",
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportSpreadsheetSample = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(
        `${API_BASE}/admin/places/import-spreadsheet`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fieldMapping: {
              nameEn: "Venue_Name_EN",
              nameAr: "Venue_Name_AR",
              cityId: "City",
              categoryId: "Category",
              neighborhoodEn: "District_EN",
              neighborhoodAr: "District_AR",
              priceRange: "Price_Tier",
              kidsFriendly: "Kids_Friendly",
              parking: "Parking",
            },
            rows: [
              {
                Venue_Name_EN: "Saadiyat Beach Club Lounge",
                Venue_Name_AR: "لاونج نادي شاطئ السعديات",
                City: "abudhabi",
                Category: "cat-restaurants",
                District_EN: "Saadiyat Island",
                District_AR: "جزيرة السعديات",
                Price_Tier: "UPSCALE",
                Kids_Friendly: "AVAILABLE",
                Parking: "AVAILABLE",
              },
              {
                Venue_Name_EN: "Diriyah Specialty Roasters",
                Venue_Name_AR: "محمصة الدرعية المختصة",
                City: "riyadh",
                Category: "cat-cafes",
                District_EN: "Hittin",
                District_AR: "حطين",
                Price_Tier: "MODERATE",
                Kids_Friendly: "AVAILABLE",
                Parking: "AVAILABLE",
              },
            ],
          }),
        },
      ).then((r) => r.json());
      setActionBanner(
        isAr
          ? `تم استيراد ${res.importedCount} أماكن من جدول البيانات مع ربط الحقول تلقائياً.`
          : `Bulk-imported ${res.importedCount} places from mapped spreadsheet columns.`,
      );
      await loadAdminData();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleSchedulePlaceRecheck = async (placeId: string) => {
    const res = await adminFetch(
      `${API_BASE}/admin/places/${placeId}/schedule-recheck`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: "Maha Al-Mazrouei (Content Editor)",
          frequency: "MONTHLY",
        }),
      },
    ).then((r) => r.json());
    setActionBanner(
      isAr
        ? `تمت جدولة إعادة فحص دورية (${res?.schedule?.frequency}) للمكان بتاريخ ${res?.schedule?.nextRecheckDate}.`
        : `Scheduled ${res?.schedule?.frequency} content recheck for ${res?.schedule?.placeNameEn} on ${res?.schedule?.nextRecheckDate}.`,
    );
    await loadAdminData();
  };

  const filteredPlaces = places.filter((p) =>
    cityFilter === "ALL" ? true : p.cityId === cityFilter,
  );

  const adminInitials = (adminUser?.name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (authChecking || !adminUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#072549] p-6 text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-[#00D2B4]" />
          <span className="text-sm font-extrabold tracking-wide">
            Verifying Wherio Administrator Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="admin-shell bg-slate-100 text-slate-900"
    >
      {/* Mobile / Tablet Backdrop when Sidebar Drawer is Open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`admin-sidebar flex flex-col justify-between bg-[#072549] p-5 text-white shadow-xl ${
          isSidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div>
          {/* Wherio Brand Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 80 80"
                fill="none"
                className="h-10 w-10 shrink-0"
              >
                <path
                  d="M40 7C29.5 7 21 15.5 21 26C21 36.2 40 53 40 53C40 53 59 36.2 59 26C59 15.5 50.5 7 40 7ZM40 32.5C36.1 32.5 33 29.4 33 25.5C33 21.6 36.1 18.5 40 18.5C43.9 18.5 47 21.6 47 25.5C47 29.4 43.9 32.5 40 32.5Z"
                  fill="#0088FF"
                />
                <path
                  d="M8 29C13 28 19 36 26 57L40 39L34 31L26 44C21 32 15 25 8 29Z"
                  fill="#00D2B4"
                />
                <path
                  d="M72 29C67 28 61 36 54 57L40 39L46 31L54 44C59 32 65 25 72 29Z"
                  fill="#FF991F"
                />
              </svg>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-white">
                    Wherio
                  </span>
                  <span className="rounded-md bg-[#FF991F] px-1.5 py-0.5 text-[10px] font-extrabold text-[#072549]">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-sky-200/80">
                  {isAr
                    ? "بوابة الحوكمة وجودة البيانات"
                    : "Governance & Data Quality"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-1.5 text-sky-200 hover:bg-white/10 lg:hidden"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-6 space-y-1.5">
            {[
              {
                id: "overview",
                labelEn: "1. Launch Readiness & KPIs",
                labelAr: "١. جاهزية الإطلاق والمؤشرات",
                icon: <LayoutDashboard className="h-4 w-4" />,
              },
              {
                id: "places",
                labelEn: "2. Places & Data Quality",
                labelAr: "٢. الأماكن وجودة البيانات",
                icon: <FileCheck2 className="h-4 w-4" />,
              },
              {
                id: "cities",
                labelEn: "3. Geo & City Activation",
                labelAr: "٣. تفعيل المدن والمناطق",
                icon: <Globe className="h-4 w-4" />,
              },
              {
                id: "reviews",
                labelEn: "4. Review Moderation",
                labelAr: "٤. الإشراف على التقييمات",
                icon: <ShieldCheck className="h-4 w-4" />,
              },
              {
                id: "users",
                labelEn: "5. Users & Roles",
                labelAr: "٥. المستخدمون والصلاحيات",
                icon: <Users className="h-4 w-4" />,
              },
              {
                id: "audit",
                labelEn: "6. Audit Log & Backups",
                labelAr: "٦. سجل العمليات والنسخ الاحتياطي",
                icon: <History className="h-4 w-4" />,
              },
              {
                id: "parking",
                labelEn: "7. Smart Parking & Camera AI",
                labelAr: "٧. المواقف الذكية وكاميرا AI",
                icon: <Camera className="h-4 w-4" />,
              },
              {
                id: "delivery",
                labelEn: "8. E-Commerce & 3D Delivery",
                labelAr: "٨. المتجر وتحسين التوصيل 3D",
                icon: <Truck className="h-4 w-4" />,
              },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                    active
                      ? "bg-[#0072DC] text-white shadow-sm"
                      : "text-sky-100/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{isAr ? item.labelAr : item.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Links */}
        <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
          <a
            href="http://localhost:3005"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 font-semibold text-sky-100 hover:bg-white/15"
          >
            <span>
              {isAr
                ? "منصة العملاء (Port 3005)"
                : "Customer Web App (Port 3005)"}
            </span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="http://localhost:4000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 font-semibold text-[#FFC233] hover:bg-white/15"
          >
            <span>OpenAPI 3.0 Swagger (Port 4000)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-content-area overflow-y-auto">
        {/* Top Bar */}
        <header className="admin-header sticky top-0 z-30 border-b border-slate-200 bg-white shadow-2xs">
          <div className="flex items-start gap-3">
            {/* Hamburger Menu Button for <= 1024px */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="mt-0.5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-[#072549] hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-extrabold text-[#072549] sm:text-lg">
                  {isAr
                    ? "لوحة تحكم وحوكمة منصة ويريو (Wherio Phase 1 MVP — أبوظبي والرياض)"
                    : "Wherio Phase 1 Governance & Content Operations Portal"}
                </h1>
                {overview?.environment && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      overview.environment.isProduction
                        ? "bg-rose-600 text-white"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    <Database className="h-3 w-3" />
                    {overview.environment.appEnv} •{" "}
                    {overview.environment.supabaseEnabled
                      ? "Supabase DB"
                      : "Local Store"}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                {isAr
                  ? `متصل بـ API: ${API_BASE} • قاعدة البيانات: ${overview?.environment?.supabaseHost || "Local Store"}`
                  : `Connected API: ${API_BASE} • DB Host: ${overview?.environment?.supabaseHost || "Local Store"}`}
              </p>
            </div>
          </div>

          <div className="admin-header-actions">
            {/* City Filter */}
            <div className="admin-city-pills flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
              {[
                { id: "ALL", label: isAr ? "الكل" : "All Cities" },
                { id: "abudhabi", label: isAr ? "أبوظبي" : "Abu Dhabi" },
                { id: "riyadh", label: isAr ? "الرياض" : "Riyadh" },
                { id: "dubai", label: isAr ? "دبي" : "Dubai" },
                { id: "cairo", label: isAr ? "القاهرة" : "Cairo" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCityFilter(c.id)}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    cityFilter === c.id
                      ? "bg-[#072549] text-white"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#072549] hover:bg-slate-50"
            >
              <Globe className="h-3.5 w-3.5 text-[#00B89C]" />
              {isAr ? "English" : "العربية"}
            </button>

            <button
              onClick={handleExportOperationsReport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#0072DC] bg-[#0072DC]/10 px-3 py-2 text-xs font-extrabold text-[#0072DC] hover:bg-[#0072DC] hover:text-white"
            >
              <HardDriveDownload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isAr ? "تصدير تقرير العمليات (CSV)" : "Export Report (CSV)"}
              </span>
              <span className="sm:hidden">CSV</span>
            </button>

            <button
              onClick={() => loadAdminData()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0072DC] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#072549]"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isAr ? "تحديث" : "Refresh"}
              </span>
            </button>

            {/* ADMIN USER AVATAR WITH COLLAPSIBLE / UNCOLLAPSIBLE OPTIONS MENU */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left transition hover:border-[#0072DC] hover:bg-white"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#072549] to-[#0072DC] text-xs font-extrabold text-white shadow-xs">
                  {adminInitials}
                </div>
                <div className="hidden md:block">
                  <p className="max-w-[130px] truncate text-xs font-extrabold text-[#072549]">
                    {adminUser.name}
                  </p>
                  <p className="text-[10px] font-bold text-[#00B89C]">
                    {adminUser.role}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180 text-[#0072DC]" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div
                  className={`absolute z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ${
                    isAr ? "left-0" : "right-0"
                  }`}
                >
                  {/* Signed-In Admin Info Card */}
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#072549] text-sm font-extrabold text-white">
                        {adminInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-[#072549]">
                          {adminUser.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {adminUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/80 pt-2 text-[10px]">
                      <span className="rounded-md bg-[#072549] px-2 py-0.5 font-extrabold text-white">
                        {adminUser.role}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <UserCheck className="h-3 w-3" />
                        {isAr ? "مشرف موثق" : "Verified Admin"}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Menu Options */}
                  <div className="mt-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("users");
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-[#072549]"
                    >
                      <Users className="h-4 w-4 text-[#0072DC]" />
                      <span>
                        {isAr
                          ? "إدارة المستخدمين والصلاحيات"
                          : "Users & Governance Roles"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("users");
                        setShowAddUserForm(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-[#072549]"
                    >
                      <UserPlus className="h-4 w-4 text-[#00B89C]" />
                      <span>
                        {isAr ? "إضافة مستخدم جديد +" : "Add New User +"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("audit");
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-[#072549]"
                    >
                      <History className="h-4 w-4 text-amber-600" />
                      <span>
                        {isAr
                          ? "سجل العمليات والنسخ الاحتياطي"
                          : "Audit Logs & DB Backups"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLang(isAr ? "en" : "ar");
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-[#072549]"
                    >
                      <Globe className="h-4 w-4 text-[#0072DC]" />
                      <span>
                        {isAr
                          ? "التبديل إلى الإنجليزية (English)"
                          : "Switch Language (العربية)"}
                      </span>
                    </button>
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>
                      {isAr
                        ? "تسجيل الخروج من اللوحة"
                        : "Sign Out of Admin Portal"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-main space-y-6">
          {adminAuthError && (
            <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-[#072549] shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-amber-900">
                    {isAr
                      ? "مطلوب مفتاح وصول المشرف (ADMIN_API_KEY)"
                      : "Admin Access Key Required (401 Unauthorized)"}
                  </h3>
                  <p className="mt-1 text-xs text-amber-800">
                    {adminAuthError}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-700">
                    {isAr
                      ? "أدخل قيمة ADMIN_API_KEY المطابقة للخادم الخلفي أو أضفها في إعدادات متغيرات البيئة في Vercel."
                      : "Enter the ADMIN_API_KEY configured on your backend (or set ADMIN_API_KEY in Vercel Environment Variables)."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={adminKeyInput}
                    onChange={(e) => setAdminKeyInput(e.target.value)}
                    placeholder={
                      isAr ? "أدخل ADMIN_API_KEY..." : "Enter ADMIN_API_KEY..."
                    }
                    className="w-64 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0072DC]"
                  />
                  <button
                    onClick={() => {
                      const trimmed = adminKeyInput.trim();
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(
                          "wherio_admin_key",
                          trimmed,
                        );
                      }
                      loadAdminData(trimmed);
                    }}
                    className="rounded-xl bg-[#072549] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#0072DC]"
                  >
                    {isAr ? "فتح اللوحة" : "Unlock Dashboard"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {actionBanner && (
            <div className="flex items-center justify-between rounded-2xl border border-[#00B89C] bg-[#00B89C]/10 px-4 py-3 text-xs font-extrabold text-[#072549]">
              <span>{actionBanner}</span>
              <button
                onClick={() => setActionBanner(null)}
                className="text-slate-500 underline"
              >
                {isAr ? "إغلاق" : "Dismiss"}
              </button>
            </div>
          )}

          {/* =========================================================
              TAB 1: LAUNCH READINESS & EXECUTIVE KPIS
          ========================================================= */}
          {activeTab === "overview" && overview?.kpis && (
            <div className="space-y-6">
              {/* 100-Place Launch Readiness Progress Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#072549] via-[#0A2E5C] to-[#0072DC] p-6 text-white shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-[#FF991F] px-3 py-0.5 text-[10px] font-extrabold text-[#072549]">
                      {isAr
                        ? "هدف الإطلاق للمرحلة الأولى (Phase 1 Target)"
                        : "PHASE 1 LAUNCH TARGET: 100 STRUCTURED PLACES"}
                    </span>
                    <h2 className="mt-2 text-xl font-extrabold">
                      {isAr
                        ? `جاهزية دليل مدن الإطلاق (أبوظبي والرياض): ${overview.kpis.launchCitiesCurrentTotal} / 100 مكان (${overview.kpis.launchReadinessPercentage}%)`
                        : `Abu Dhabi & Riyadh Launch Directory: ${overview.kpis.launchCitiesCurrentTotal} / 100 Places (${overview.kpis.launchReadinessPercentage}%)`}
                    </h2>
                    <p className="mt-1 text-xs text-sky-100">
                      {isAr
                        ? `أبوظبي: ${overview.kpis.abuDhabiCount}/${overview.kpis.abuDhabiTarget} مكان • الرياض: ${overview.kpis.riyadhCount}/${overview.kpis.riyadhTarget} مكان • متوسط اكتمال البيانات: ${overview.kpis.avgCompletenessScore}%`
                        : `Abu Dhabi: ${overview.kpis.abuDhabiCount}/${overview.kpis.abuDhabiTarget} places • Riyadh: ${overview.kpis.riyadhCount}/${overview.kpis.riyadhTarget} places • Avg Data Completeness: ${overview.kpis.avgCompletenessScore}%`}
                    </p>
                  </div>

                  {overview.kpis.launchCitiesCurrentTotal < 100 && (
                    <button
                      onClick={handleGenerate100LaunchPlaces}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#00B89C] px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#008891]"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isAr
                        ? "استكمال الـ 100 مكان لإطلاق أبوظبي والرياض بضغطة واحدة"
                        : "1-Click Populate 100 Launch Places (50 Abu Dhabi + 50 Riyadh)"}
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00D2B4] to-[#FFC233] transition-all"
                    style={{
                      width: `${overview.kpis.launchReadinessPercentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500">
                    {isAr ? "إجمالي الأماكن المسجلة" : "Total Places in DB"}
                  </span>
                  <p className="mt-2 text-2xl font-extrabold text-[#072549]">
                    {overview.kpis.totalPlacesListed}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#0072DC]">
                    UAE: {overview.kpis.placesByCountry?.AE} • KSA:{" "}
                    {overview.kpis.placesByCountry?.SA} • EG:{" "}
                    {overview.kpis.placesByCountry?.EG}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500">
                    {isAr ? "متوسط اكتمال البيانات" : "Avg Completeness Score"}
                  </span>
                  <p className="mt-2 text-2xl font-extrabold text-[#00B89C]">
                    {overview.kpis.avgCompletenessScore}%
                  </p>
                  <p className="mt-1 text-[11px] text-amber-700">
                    {overview.kpis.placesWithMissingDataCount}{" "}
                    {isAr
                      ? "مكان يحتوي حقولاً غير معروفة (UNKNOWN)"
                      : "places have explicit UNKNOWN fields"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500">
                    {isAr
                      ? "المستخدمون الموثقون (هاتف + بريد)"
                      : "Dual-Verified Members"}
                  </span>
                  <p className="mt-2 text-2xl font-extrabold text-[#072549]">
                    {overview.kpis.dualVerifiedUsersCount} /{" "}
                    {overview.kpis.totalUsers}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-700">
                    {isAr
                      ? "مؤهلون لنشر التقييمات الموثقة"
                      : "Eligible to post Wherio reviews"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500">
                    {isAr ? "التقييمات والبلاغات" : "Reviews & Reports Queue"}
                  </span>
                  <p className="mt-2 text-2xl font-extrabold text-[#072549]">
                    {overview.kpis.totalInternalReviews}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-rose-600">
                    {overview.kpis.reportedReviewsCount}{" "}
                    {isAr
                      ? "تقييم مُبلّغ عنه بانتظار المراجعة"
                      : "reported reviews pending moderation"}
                  </p>
                </div>
              </div>

              {/* Missing Data & Completeness Watchlist */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-extrabold text-[#072549]">
                  {isAr
                    ? "قائمة متابعة الحقول الناقصة وجودة البيانات (شفافية البيانات غير المتوفرة):"
                    : "Data Quality Watchlist — Places with Explicit UNKNOWN Fields:"}
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="pb-2">Place</th>
                        <th className="pb-2">City</th>
                        <th className="pb-2">Completeness Score</th>
                        <th className="pb-2">Missing / UNKNOWN Fields</th>
                        <th className="pb-2">Source & Freshness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overview.placesWithMissingData?.map((p: any) => (
                        <tr key={p.id}>
                          <td className="py-2.5 font-bold text-[#072549]">
                            {p.nameEn}
                          </td>
                          <td className="py-2.5 uppercase text-slate-500">
                            {p.cityId}
                          </td>
                          <td className="py-2.5">
                            <span className="rounded-lg bg-amber-50 px-2 py-0.5 font-extrabold text-amber-800">
                              {p.completenessScore}%
                            </span>
                          </td>
                          <td className="py-2.5 text-rose-600 font-semibold">
                            {p.missingFields.join(", ")}
                          </td>
                          <td className="py-2.5 text-slate-500">
                            {p.sourceType} ({p.lastVerifiedAt})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: PLACES & DATA QUALITY
          ========================================================= */}
          {activeTab === "places" && (
            <div className="space-y-6">
              {/* Manual Place Entry Form by Wherio Content Team */}
              <form
                onSubmit={handleCreateManualPlace}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#072549]">
                      {isAr
                        ? "إضافة مكان يدوياً بواسطة فريق المحتوى (يحسب نسبة الاكتمال ويكتشف التكرار تلقائياً)"
                        : "Manual Place Entry by Wherio Content Team (Auto Completeness & Duplicate Check)"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? "يدعم الحالات الثلاث للتجهيزات (متاح / غير متاح / غير معروف) دون تخمين"
                        : "Supports Tri-State practical attributes (AVAILABLE / NOT_AVAILABLE / UNKNOWN)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleImportSpreadsheetSample}
                      className="rounded-xl border border-[#0072DC] bg-[#0072DC]/10 px-3.5 py-2 text-xs font-extrabold text-[#0072DC] hover:bg-[#0072DC] hover:text-white"
                    >
                      {isAr
                        ? "استيراد جدول بيانات (مع ربط الأعمدة)"
                        : "Import Mapped Spreadsheet Batch"}
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate100LaunchPlaces}
                      className="rounded-xl bg-[#00B89C] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#008891]"
                    >
                      {isAr
                        ? "توليد الـ 100 مكان للإطلاق"
                        : "Populate 100 Launch Places"}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDemoData}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-600 hover:text-white"
                    >
                      {isAr
                        ? "مسح البيانات التجريبية (تصفير للإنتاج)"
                        : "Clear Demo Data (Clean Production)"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <select
                    value={newPlace.cityId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setNewPlace({
                        ...newPlace,
                        cityId: cid,
                        countryCode:
                          cid === "abudhabi" || cid === "dubai"
                            ? "AE"
                            : cid === "cairo"
                              ? "EG"
                              : "SA",
                      });
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  >
                    <option value="abudhabi">Abu Dhabi (UAE — Launch)</option>
                    <option value="riyadh">Riyadh (KSA — Launch)</option>
                    <option value="dubai">Dubai (UAE)</option>
                    <option value="cairo">Cairo (Egypt)</option>
                  </select>

                  <select
                    value={newPlace.categoryId}
                    onChange={(e) =>
                      setNewPlace({ ...newPlace, categoryId: e.target.value })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  >
                    <option value="cat-restaurants">
                      1. Restaurants (مطاعم)
                    </option>
                    <option value="cat-cafes">2. Cafes (مقاهي)</option>
                    <option value="cat-cinemas">3. Cinemas (سينما)</option>
                    <option value="cat-entertainment">
                      4. Entertainment & Activities (ترفيه)
                    </option>
                    <option value="cat-parking">
                      5. Parking Spots (مواقف السيارات)
                    </option>
                  </select>

                  <input
                    type="text"
                    required
                    placeholder="Place Name (English)"
                    value={newPlace.nameEn}
                    onChange={(e) =>
                      setNewPlace({ ...newPlace, nameEn: e.target.value })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="اسم المكان (عربي)"
                    value={newPlace.nameAr}
                    onChange={(e) =>
                      setNewPlace({ ...newPlace, nameAr: e.target.value })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />

                  <select
                    value={newPlace.priceRange}
                    onChange={(e) =>
                      setNewPlace({
                        ...newPlace,
                        priceRange: e.target.value as any,
                      })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="BUDGET">Price: BUDGET</option>
                    <option value="MODERATE">Price: MODERATE</option>
                    <option value="UPSCALE">Price: UPSCALE</option>
                    <option value="UNKNOWN">
                      Price: UNKNOWN (Missing Data)
                    </option>
                  </select>

                  <select
                    value={newPlace.kidsFriendly}
                    onChange={(e) =>
                      setNewPlace({
                        ...newPlace,
                        kidsFriendly: e.target.value as any,
                      })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="AVAILABLE">Kids Friendly: AVAILABLE</option>
                    <option value="NOT_AVAILABLE">
                      Kids Friendly: NOT_AVAILABLE
                    </option>
                    <option value="UNKNOWN">Kids Friendly: UNKNOWN</option>
                  </select>

                  <select
                    value={newPlace.parking}
                    onChange={(e) =>
                      setNewPlace({
                        ...newPlace,
                        parking: e.target.value as any,
                      })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="AVAILABLE">Parking: AVAILABLE</option>
                    <option value="NOT_AVAILABLE">
                      Parking: NOT_AVAILABLE
                    </option>
                    <option value="UNKNOWN">Parking: UNKNOWN</option>
                  </select>

                  <select
                    value={newPlace.valetParking}
                    onChange={(e) =>
                      setNewPlace({
                        ...newPlace,
                        valetParking: e.target.value as any,
                      })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="AVAILABLE">
                      Valet: AVAILABLE (فاليه متاح)
                    </option>
                    <option value="NOT_AVAILABLE">
                      Valet: NOT_AVAILABLE (غير متاح)
                    </option>
                    <option value="UNKNOWN">Valet: UNKNOWN (غير معروف)</option>
                  </select>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#072549] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#0072DC]"
                  >
                    <Plus className="h-4 w-4" />
                    {isAr ? "حفظ المكان وفحص الجودة" : "Save & Score Quality"}
                  </button>
                </div>
              </form>

              {/* Places Table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-extrabold text-[#072549]">
                  {isAr
                    ? `دليل الأماكن الموثقة (${filteredPlaces.length}):`
                    : `Structured Places Directory (${filteredPlaces.length}):`}
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="pb-2">Venue</th>
                        <th className="pb-2">City & Area</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Tri-State Attributes</th>
                        <th className="pb-2">Completeness & Workflow</th>
                        <th className="pb-2">Ratings (Int / Ext)</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPlaces.map((p: any) => (
                        <tr key={p.id}>
                          <td className="py-3">
                            <p className="font-extrabold text-[#072549]">
                              {p.nameEn}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {p.nameAr}
                            </p>
                          </td>
                          <td className="py-3">
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-bold uppercase text-[#072549]">
                              {p.cityId}
                            </span>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {p.neighborhoodEn}
                            </p>
                          </td>
                          <td className="py-3 font-semibold text-[#0072DC]">
                            <div>{p.categoryId}</div>
                            {p.categoryId === "cat-parking" && (() => {
                              const cfg = parkingConfigs.find(
                                (c: any) => c.placeId === p.id,
                              );
                              return cfg ? (
                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-extrabold text-white ${
                                      cfg.managementMode === "CAMERA_AI"
                                        ? "bg-emerald-600"
                                        : "bg-amber-600"
                                    }`}
                                  >
                                    <Camera className="h-2.5 w-2.5" />
                                    {cfg.managementMode}
                                  </span>
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                                    {cfg.availableSlotsCount}/{cfg.totalSlots}{" "}
                                    Free
                                  </span>
                                </div>
                              ) : null;
                            })()}
                          </td>
                          <td className="py-3 text-[11px]">
                            <div>
                              Kids:{" "}
                              <strong>{p.attributes?.kidsFriendly}</strong>
                            </div>
                            <div>
                              Parking: <strong>{p.attributes?.parking}</strong>
                            </div>
                            <div>
                              Valet:{" "}
                              <strong>
                                {p.attributes?.valetParking || "UNKNOWN"}
                              </strong>
                            </div>
                            <div>
                              Price: <strong>{p.priceRange}</strong>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap items-center gap-1">
                              <span
                                className={`rounded-lg px-2 py-0.5 font-extrabold ${
                                  (p.dataQuality?.completenessScore || 90) >= 90
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "bg-amber-50 text-amber-800"
                                }`}
                              >
                                {p.dataQuality?.completenessScore ?? 90}%
                              </span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                                {p.dataQuality?.status || "PUBLISHED"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="font-extrabold text-amber-600">
                              ★ {p.internalRating?.overallAvg ?? p.avgRating}
                            </span>
                            {p.externalRating && (
                              <p className="text-[10px] text-slate-400">
                                Ext: {p.externalRating.rating}/5
                              </p>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {p.categoryId === "cat-parking" && (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("parking")}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700 hover:bg-emerald-100"
                                  title="Configure Camera AI vs Manual Slot Mode"
                                >
                                  <Camera className="h-3 w-3" />
                                  {isAr ? "إعدادات المواقف" : "Slots & Camera"}
                                </button>
                              )}
                              {p.dataQuality?.status !== "PUBLISHED" ? (
                                <button
                                  onClick={() =>
                                    handleUpdatePlaceWorkflow(
                                      p.id,
                                      "PUBLISHED",
                                      "ACTIVE",
                                    )
                                  }
                                  className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                                >
                                  Publish
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleUpdatePlaceWorkflow(
                                      p.id,
                                      "DRAFT",
                                      "ACTIVE",
                                    )
                                  }
                                  className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
                                >
                                  Draft
                                </button>
                              )}
                              <button
                                onClick={() => handleSchedulePlaceRecheck(p.id)}
                                className="rounded-lg bg-sky-50 px-2 py-1 text-[10px] font-bold text-[#0072DC] hover:bg-sky-100"
                                title="Schedule recurring content recheck"
                              >
                                {isAr ? "جدولة فحص" : "Schedule Recheck"}
                              </button>
                              <button
                                onClick={() => handleDeletePlace(p.id)}
                                className="rounded-lg bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 3: GEO & CITY ACTIVATION
          ========================================================= */}
          {activeTab === "cities" && overview && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold text-[#072549]">
                {isAr
                  ? "إدارة المدن والمناطق الجغرافية والمنطقة الزمنية (التوسع بدون تعديل الكود):"
                  : "Geo & City Activation Governance (Activate New Cities Without Re-Engineering):"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {isAr
                  ? "مدن الإطلاق للمرحلة الأولى هي أبوظبي والرياض. يمكنك تفعيل أو إيقاف أي مدينة إضافية فوراً."
                  : "Abu Dhabi and Riyadh are active for Phase 1 launch. Toggle any expansion city to make it live in the customer app."}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {overview.cities?.map((city: any) => (
                  <div
                    key={city.id}
                    className={`rounded-2xl border p-4 ${
                      city.isActive
                        ? "border-[#00B89C] bg-emerald-50/30"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#072549] px-2 py-0.5 text-[10px] font-extrabold text-white">
                            {city.countryCode}
                          </span>
                          <h4 className="text-sm font-extrabold text-[#072549]">
                            {city.nameEn} ({city.nameAr})
                          </h4>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Timezone: <strong>{city.timezone}</strong> • Launch
                          City:{" "}
                          <strong>
                            {city.isLaunchCity ? "YES" : "Expansion"}
                          </strong>
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleCityActive(city.id)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                          city.isActive
                            ? "bg-emerald-700 text-white hover:bg-emerald-800"
                            : "bg-slate-800 text-white hover:bg-[#0072DC]"
                        }`}
                      >
                        {city.isActive
                          ? isAr
                            ? "نشطة (Active ✓)"
                            : "Active ✓ (Click to Disable)"
                          : isAr
                            ? "غير مفعلة (تفعيل الآن)"
                            : "Inactive (Click to Activate)"}
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {city.areas?.map((a: any) => (
                        <span
                          key={a.id}
                          className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs"
                        >
                          {a.nameEn} • {a.nameAr}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 4: REVIEW MODERATION
          ========================================================= */}
          {activeTab === "reviews" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold text-[#072549]">
                {isAr
                  ? "الإشراف على التقييمات ومعالجة البلاغات:"
                  : "Verified Reviews & Reported Reviews Moderation Queue:"}
              </h3>
              <div className="mt-4 space-y-3">
                {reviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    className={`rounded-2xl border p-4 ${
                      rev.moderationStatus === "REPORTED"
                        ? "border-rose-300 bg-rose-50/50"
                        : rev.moderationStatus === "HIDDEN"
                          ? "border-slate-200 bg-slate-100 opacity-60"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#072549]">
                            {rev.userName}
                          </span>
                          <span className="text-xs text-slate-400">→</span>
                          <span className="text-xs font-bold text-[#0072DC]">
                            {rev.placeNameEn}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                              rev.moderationStatus === "REPORTED"
                                ? "bg-rose-600 text-white"
                                : rev.moderationStatus === "HIDDEN"
                                  ? "bg-slate-600 text-white"
                                  : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {rev.moderationStatus}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-700">
                          {rev.commentEn}
                        </p>
                        {rev.reports?.length > 0 && (
                          <p className="mt-1 text-[11px] font-bold text-rose-700">
                            <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                            Reports ({rev.reports.length}):{" "}
                            {rev.reports.map((r: any) => r.reason).join(" | ")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleModerateReview(rev.id, "APPROVED")
                          }
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerateReview(rev.id, "HIDDEN")}
                          className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          Hide
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="rounded-xl bg-rose-100 p-1.5 text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 5: USERS, ROLES & DUAL VERIFICATION
          ========================================================= */}
          {activeTab === "users" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#072549]">
                      {isAr
                        ? "المستخدمون، حالة التوثيق المزدوج (هاتف OTP + بريد فريد)، والأدوار الإدارية:"
                        : "Users, Dual Verification Status (Phone OTP + Unique Email) & Governance Roles:"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {isAr
                        ? "يمكنك إضافة مستخدم جديد أو مشرف جديد وتحديد دوره الإداري وحالة التوثيق المزدوج."
                        : "Manage registered users, governance roles, dual verification status, or add a new user/admin account."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddUserForm((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00B89C] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#072549]"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>
                      {showAddUserForm
                        ? isAr
                          ? "إغلاق النموذج"
                          : "Close Form"
                        : isAr
                          ? "+ إضافة مستخدم جديد"
                          : "+ Add New User"}
                    </span>
                  </button>
                </div>

                {/* Collapsible Add New User Form */}
                {showAddUserForm && (
                  <form
                    onSubmit={handleCreateNewUser}
                    className="mt-5 rounded-2xl border border-[#0072DC]/30 bg-slate-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                      <h4 className="flex items-center gap-2 text-xs font-extrabold text-[#072549]">
                        <UserPlus className="h-4 w-4 text-[#0072DC]" />
                        {isAr
                          ? "إضافة مستخدم أو مشرف جديد إلى النظام"
                          : "Add New User / Governance Staff Member"}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {isAr
                          ? "ملاحظة: تحديد كلمة مرور يسمح للمشرف بتسجيل الدخول عبر /login"
                          : "Tip: Setting a password allows staff roles to sign in at /login"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                          {isAr ? "الاسم الكامل *" : "Full Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={newUserForm.name}
                          onChange={(e) =>
                            setNewUserForm({
                              ...newUserForm,
                              name: e.target.value,
                            })
                          }
                          placeholder={
                            isAr ? "مثال: خالد العتيبي" : "e.g. Khalid Al-Otaibi"
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                          {isAr
                            ? "البريد الإلكتروني (فريد) *"
                            : "Email Address (Unique) *"}
                        </label>
                        <input
                          type="email"
                          required
                          value={newUserForm.email}
                          onChange={(e) =>
                            setNewUserForm({
                              ...newUserForm,
                              email: e.target.value,
                            })
                          }
                          placeholder="user@wherio.com"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                          {isAr
                            ? "رقم الهاتف (فريد) *"
                            : "Phone Number (Unique) *"}
                        </label>
                        <input
                          type="tel"
                          required
                          value={newUserForm.phone}
                          onChange={(e) =>
                            setNewUserForm({
                              ...newUserForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+971501234567"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                          {isAr ? "الدولة" : "Country"}
                        </label>
                        <select
                          value={newUserForm.countryCode}
                          onChange={(e) =>
                            setNewUserForm({
                              ...newUserForm,
                              countryCode: e.target.value as
                                | "AE"
                                | "SA"
                                | "EG",
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#0072DC]"
                        >
                          <option value="AE">🇦🇪 UAE (AE)</option>
                          <option value="SA">🇸🇦 Saudi Arabia (SA)</option>
                          <option value="EG">🇪🇬 Egypt (EG)</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                          {isAr ? "الدور والصلاحية *" : "Role *"}
                        </label>
                        <select
                          value={newUserForm.role}
                          onChange={(e) =>
                            setNewUserForm({
                              ...newUserForm,
                              role: e.target.value as any,
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#0072DC]"
                        >
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="CONTENT_EDITOR">CONTENT_EDITOR</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="MERCHANT_ADMIN">MERCHANT_ADMIN</option>
                          <option value="CUSTOMER">CUSTOMER</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                          {isAr
                            ? "كلمة المرور (للمشرفين)"
                            : "Password (for Admin Login)"}
                        </label>
                        <input
                          type="password"
                          value={newUserForm.password}
                          onChange={(e) =>
                            setNewUserForm({
                              ...newUserForm,
                              password: e.target.value,
                            })
                          }
                          placeholder={
                            isAr
                              ? "6 أحرف على الأقل (اختياري للعملاء)"
                              : "Min 6 chars (optional for customer)"
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC]"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-3">
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newUserForm.isPhoneVerified}
                            onChange={(e) =>
                              setNewUserForm({
                                ...newUserForm,
                                isPhoneVerified: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded accent-[#00B89C]"
                          />
                          <span>
                            {isAr
                              ? "الهاتف موثق (Phone OTP Verified)"
                              : "Phone OTP Verified"}
                          </span>
                        </label>

                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newUserForm.isEmailVerified}
                            onChange={(e) =>
                              setNewUserForm({
                                ...newUserForm,
                                isEmailVerified: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded accent-[#00B89C]"
                          />
                          <span>
                            {isAr
                              ? "البريد موثق (Email Verified)"
                              : "Email Verified"}
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddUserForm(false)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                          {isAr ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                          type="submit"
                          disabled={addingUser}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#072549] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#0072DC] disabled:opacity-60"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>
                            {addingUser
                              ? isAr
                                ? "جاري الحفظ..."
                                : "Saving..."
                              : isAr
                                ? "حفظ المستخدم الجديد"
                                : "Create User"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Phone (Unique)</th>
                        <th className="pb-2">Email (Unique)</th>
                        <th className="pb-2">Role</th>
                        <th className="pb-2">Dual Verification</th>
                        <th className="pb-2">Account Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u: any) => (
                        <tr key={u.id}>
                          <td className="py-3 font-extrabold text-[#072549]">
                            {u.name}
                          </td>
                          <td className="py-3 font-mono text-slate-600">
                            {u.phone}
                          </td>
                          <td className="py-3 text-slate-600">{u.email}</td>
                          <td className="py-3">
                            <span className="rounded-lg bg-[#072549] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  u.isPhoneVerified
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                Phone OTP: {u.isPhoneVerified ? "YES" : "NO"}
                              </span>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  u.isEmailVerified
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                Email: {u.isEmailVerified ? "YES" : "PENDING"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() =>
                                handleToggleUserSuspension(
                                  u.id,
                                  Boolean(u.isSuspended),
                                )
                              }
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                                u.isSuspended
                                  ? "bg-rose-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                              }`}
                            >
                              <Ban className="h-3 w-3" />
                              {u.isSuspended
                                ? "Suspended (Restore)"
                                : "Active (Suspend)"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 6: GOVERNANCE AUDIT LOG & DB ARCHITECTURE
          ========================================================= */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-[#0072DC]" />
                    <h3 className="text-sm font-extrabold text-[#072549]">
                      {isAr
                        ? "الأساس التقني والنسخ الاحتياطي لقاعدة البيانات"
                        : "Platform Foundation, Health Monitoring & Database Backup"}
                    </h3>
                  </div>

                  <button
                    onClick={handleTriggerDatabaseBackup}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#072549] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#0072DC]"
                  >
                    <HardDriveDownload className="h-4 w-4" />
                    {isAr
                      ? "إنشاء نسخة احتياطية فورية"
                      : "Create Database Backup Snapshot"}
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {isAr
                    ? "يعمل النظام حالياً بقاعدة بيانات JSON المستمرة في المسار D:\\NEST JS\\awfar\\database\\awfar-store.json، بالإضافة إلى مخطط PostgreSQL 16 + PostGIS الجاهز للإنتاج في D:\\NEST JS\\awfar\\database\\schema.sql."
                    : "All changes made here persist automatically to D:\\NEST JS\\awfar\\database\\awfar-store.json, with a production PostgreSQL 16 + PostGIS schema provided in D:\\NEST JS\\awfar\\database\\schema.sql."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-extrabold text-[#072549]">
                  {isAr
                    ? "سجل التدقيق والحوكمة الزمني (Governance Audit Log):"
                    : "Chronological Governance Audit Log:"}
                </h3>
                <div className="mt-4 space-y-2">
                  {auditLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs"
                    >
                      <div>
                        <span className="rounded bg-[#0072DC] px-2 py-0.5 text-[10px] font-extrabold text-white">
                          {log.actionType}
                        </span>
                        <span className="ml-2 font-extrabold text-[#072549]">
                          {log.actorName} ({log.actorRole})
                        </span>
                        <p className="mt-1 text-slate-600">
                          {isAr ? log.summaryAr : log.summaryEn}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {String(log.createdAt).slice(0, 19).replace("T", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(activeTab === "parking" || activeTab === "delivery") && (
            <SmartOperationsPanels
              activeTab={activeTab}
              isAr={isAr}
              cityFilter={cityFilter}
              apiBase={API_BASE}
              adminFetch={(url, opts) => adminFetch(url, opts)}
              parkingConfigs={parkingConfigs}
              parkingReservations={parkingReservations}
              catalogProducts={catalogProducts}
              ecommerceOrders={ecommerceOrders}
              deliveryBatches={deliveryBatches}
              vehicleSpecs={vehicleSpecs}
              onRefresh={() => loadAdminData()}
              setActionBanner={setActionBanner}
            />
          )}
        </main>
      </div>
    </div>
  );
}
