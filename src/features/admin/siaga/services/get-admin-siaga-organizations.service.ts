import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";
import { requireSiagaAdmin } from "@/features/admin/siaga/server/require-siaga-admin";

const ALLOWED_STATUSES: readonly string[] = [
  "DRAFT",
  "PENDING",
  "NEEDS_CORRECTION",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
];

interface AdminSiagaOrganizationsOptions {
  status: string | null;
  search: string | null;
}

export async function getAdminSiagaOrganizations(
  options: AdminSiagaOrganizationsOptions,
) {
  await requireSiagaAdmin();

  const status = options.status?.trim().toUpperCase() || "PENDING";
  const search = options.search?.trim() || "";

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  if (search.length > 100) {
    throw new Error("INVALID_SEARCH");
  }

  let organizationQuery = adminSupabase
    .from("emergency_organizations")
    .select(
      "id, created_by, organization_name, organization_type, registration_identifier, description, official_phone, official_whatsapp, contact_email, website_url, public_address, district, city, province, coverage_description, verification_status, verified_at, verified_source_label, verified_source_url, created_at, updated_at",
    )
    .eq("verification_status", status)
    .order("created_at", { ascending: true })
    .limit(100);

  if (search) {
    organizationQuery = organizationQuery.ilike(
      "organization_name",
      `%${search}%`,
    );
  }

  const {
    data: organizations,
    error: organizationError,
  } = await organizationQuery;

  if (organizationError) {
    console.error(
      "Admin Siaga organization query failed:",
      organizationError.code,
    );
    throw new Error("SIAGA_ORGANIZATION_LIST_UNAVAILABLE");
  }

  const organizationRows = organizations ?? [];

  if (organizationRows.length === 0) {
    return { items: [] };
  }

  const organizationIds = organizationRows.map(
    (organization) => organization.id,
  );

  const {
    data: services,
    error: serviceError,
  } = await adminSupabase
    .from("emergency_provider_services")
    .select(
      "id, organization_id, name, category, description, public_phone, public_whatsapp, service_area, cost_type, operating_hours, review_status, is_active, created_at, updated_at",
    )
    .in("organization_id", organizationIds)
    .order("created_at", { ascending: true });

  if (serviceError) {
    console.error(
      "Admin Siaga service query failed:",
      serviceError.code,
    );
    throw new Error("SIAGA_ORGANIZATION_LIST_UNAVAILABLE");
  }

  const serviceRows = services ?? [];

  return {
    items: organizationRows.map((organization) => ({
      id: organization.id,
      createdBy: organization.created_by,
      organizationName: organization.organization_name,
      organizationType: organization.organization_type,
      registrationIdentifier: organization.registration_identifier,
      description: organization.description,
      officialPhone: organization.official_phone,
      officialWhatsapp: organization.official_whatsapp,
      contactEmail: organization.contact_email,
      websiteUrl: organization.website_url,
      publicAddress: organization.public_address,
      district: organization.district,
      city: organization.city,
      province: organization.province,
      coverageDescription: organization.coverage_description,
      verificationStatus: organization.verification_status,
      verifiedAt: organization.verified_at,
      verifiedSourceLabel: organization.verified_source_label,
      verifiedSourceUrl: organization.verified_source_url,
      createdAt: organization.created_at,
      updatedAt: organization.updated_at,
      services: serviceRows
        .filter(
          (service) =>
            service.organization_id === organization.id,
        )
        .map((service) => ({
          id: service.id,
          name: service.name,
          category: service.category,
          description: service.description,
          publicPhone: service.public_phone,
          publicWhatsapp: service.public_whatsapp,
          serviceArea: service.service_area,
          costType: service.cost_type,
          operatingHours: service.operating_hours,
          reviewStatus: service.review_status,
          isActive: service.is_active,
          createdAt: service.created_at,
          updatedAt: service.updated_at,
        })),
    })),
  };
}