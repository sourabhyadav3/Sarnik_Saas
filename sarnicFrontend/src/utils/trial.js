export const getStoredTrial = () => {
  try {
    const raw = localStorage.getItem("sarnik_trial");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredTrial = (trialData) => {
  if (trialData) {
    localStorage.setItem("sarnik_trial", JSON.stringify(trialData));
  } else {
    localStorage.removeItem("sarnik_trial");
  }
};

export const startFreeTrial = () => {
  const trialStartDate = new Date().toISOString();
  const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const trialData = {
    trialStartDate,
    trialEndDate,
    trialStatus: "trial"
  };
  setStoredTrial(trialData);
  return trialData;
};

export const checkTrialStatus = () => {
  const trial = getStoredTrial();
  if (!trial) return { active: false, expired: false, daysRemaining: 0 };

  const now = new Date();
  const endDate = new Date(trial.trialEndDate);

  if (now > endDate) {
    if (trial.trialStatus !== "expired") {
      trial.trialStatus = "expired";
      setStoredTrial(trial);
    }
    return { active: false, expired: true, daysRemaining: 0 };
  }

  // Calculate days remaining (fractional or rounded up)
  const diffTime = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    active: trial.trialStatus === "trial",
    expired: false,
    daysRemaining
  };
};
