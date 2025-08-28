const API_BASE_URL = 'https://login-api.snolep.com';
const FINANCE_API_BASE_URL = 'https://finance-api.snolep.com';

const getAuthHeaders = (token, contentType = 'application/json') => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'accept': 'application/json'
  };
  if (contentType !== null && contentType) {
    headers['Content-Type'] = contentType;
  }
  return headers;
};


const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.detail || 'An unknown error occurred');
  }
  if (response.status === 204) { // No Content
    return null;
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return response.blob();
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/profile/`, {
    headers: getAuthHeaders(token)
  });
  return handleResponse(response);
};

export const getEntities = async (token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/api/entities/`, {
      method: 'GET',
      headers: getAuthHeaders(token)
  });
  if (response.status === 404) return [];
  return handleResponse(response).catch(err => {
      console.error('Failed to fetch entities:', err);
      return [];
  });
};

export const updateName = async (firstName, lastName, token) => {
  const response = await fetch(`${API_BASE_URL}/profile/name`, {
    method: 'PUT',
    headers: getAuthHeaders(token, 'application/x-www-form-urlencoded'),
    body: new URLSearchParams({ first_name: firstName, last_name: lastName })
  });
  return handleResponse(response);
};

export const updatePassword = async (currentPassword, newPassword, confirmPassword, token) => {
    const response = await fetch(`${API_BASE_URL}/profile/password`, {
        method: 'PUT',
        headers: getAuthHeaders(token, 'application/x-www-form-urlencoded'),
        body: new URLSearchParams({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword })
    });
    return handleResponse(response);
};

export const toggle2FA = async (enable, token) => {
    const response = await fetch(`${API_BASE_URL}/profile/2fa`, {
        method: 'PUT',
        headers: getAuthHeaders(token, 'application/x-www-form-urlencoded'),
        body: new URLSearchParams({ enable_2fa: enable })
    });
    return handleResponse(response);
};

export const verify2FA = async (otp, token) => {
    const response = await fetch(`${API_BASE_URL}/profile/2fa/verify`, {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/x-www-form-urlencoded'),
        body: new URLSearchParams({ otp })
    });
    return handleResponse(response);
};

// Dashboard
export const getDashboardData = async (entityId, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/api/dashboard/?entity_id=${entityId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

// Beneficiary API calls
export const getBeneficiaries = async (token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/beneficiaries/`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const addBeneficiary = async (beneficiaryData, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/beneficiaries/`, {
    method: 'POST',
    headers: getAuthHeaders(token, 'application/x-www-form-urlencoded'),
    body: new URLSearchParams(beneficiaryData),
  });
  return handleResponse(response);
};

export const deleteBeneficiary = async (beneficiaryId, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/beneficiaries/${beneficiaryId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

// Bank Account API calls for Beneficiaries
export const getBankAccountsForBeneficiary = async (beneficiaryId, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/beneficiaries/${beneficiaryId}/bank_accounts`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

export const addBankAccount = async (beneficiaryId, bankAccountData, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/beneficiaries/${beneficiaryId}/bank_accounts`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(bankAccountData),
  });
  return handleResponse(response);
};

export const deleteBankAccount = async (beneficiaryId, bankAccountId, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/beneficiaries/${beneficiaryId}/bank_accounts/${bankAccountId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

// Organisation Bank Account API calls
export const getOrganisationBankAccounts = async (entityId, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/bank_accounts/?entity_id=${entityId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const addOrganisationBankAccount = async (data, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/bank_accounts/`, {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/x-www-form-urlencoded'),
        body: new URLSearchParams(data),
    });
    return handleResponse(response);
};

export const deleteOrganisationBankAccount = async (bankAccountId, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/bank_accounts/${bankAccountId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};


// Invoice API calls
export const getInvoices = async (entityId, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/invoices/?entity_id=${entityId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const addInvoice = async (invoiceFormData, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/invoices/`, {
    method: 'POST',
    headers: getAuthHeaders(token, null), // Let browser set Content-Type for multipart/form-data
    body: invoiceFormData,
  });
  return handleResponse(response);
};

export const deleteInvoice = async (entityId, invoiceId, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/invoices/${invoiceId}?entity_id=${entityId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

// Voucher API calls
export const getVouchers = async (entityId, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/vouchers/?entity_id=${entityId}`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

export const addVoucher = async (voucherData, token) => {
  const response = await fetch(`${FINANCE_API_BASE_URL}/finance/vouchers/`, {
    method: 'POST',
    headers: getAuthHeaders(token, 'application/x-www-form-urlencoded'),
    body: new URLSearchParams(voucherData),
  });
  return handleResponse(response);
};

export const deleteVoucher = async (entityId, voucherId, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/vouchers/${voucherId}?entity_id=${entityId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

// Document API Calls
export const getDocuments = async (entityId, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/documents/?entity_id=${entityId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const createFolder = async (folderName, entityId, parentId, token) => {
    let url = `${FINANCE_API_BASE_URL}/finance/documents/folder?folder_name=${encodeURIComponent(folderName)}&entity_id=${entityId}`;
    if (parentId && parentId !== 'root') {
        url += `&parent_id=${parentId}`;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const uploadFile = async (folderId, entityId, file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_id', entityId);
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/documents/?folder_id=${folderId}`, {
        method: 'POST',
        headers: getAuthHeaders(token, null),
        body: formData,
    });
    return handleResponse(response);
};

export const deleteDocument = async (documentId, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/documents/${documentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const shareDocument = async (documentId, email, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/documents/${documentId}/share?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const viewFile = async (documentId, token) => {
    const response = await fetch(`${FINANCE_API_BASE_URL}/finance/documents/${documentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
};