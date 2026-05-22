/**
 * Reusable tenant query isolation helper.
 * Generates SQL condition and parameters based on the request's tenant context.
 * 
 * @param {Object} tenant - req.tenant context { companyId, isIsolated }
 * @param {Array} paramArray - Existing query parameters array
 * @param {string} [prefix] - Optional table alias prefix (e.g. 'p' for 'p.company_id')
 * @returns {Object} { sql: string, params: Array }
 */
export const buildTenantCondition = (tenant, paramArray = [], prefix = "") => {
  const col = prefix ? `\`${prefix}\`.company_id` : "`company_id`";
  
  if (!tenant || !tenant.isIsolated) {
    // Superadmin bypasses tenant isolation completely
    return { sql: "1=1", params: paramArray };
  }

  if (tenant.companyId === null) {
    // Legacy users see only legacy data (company_id is NULL)
    return { sql: `(${col} IS NULL)`, params: paramArray };
  } else {
    // Tenant users see only their company's data
    return { sql: `(${col} = ?)`, params: [...paramArray, tenant.companyId] };
  }
};
