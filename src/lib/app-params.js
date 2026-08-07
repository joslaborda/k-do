const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}
// Fix (ago 2026) — login por email/contraseña en web dejaba fuera al
// usuario aunque el login funcionara perfectamente en el servidor (visible
// en los Registros de base44 como "app.auth.login" con éxito, auth_method:
// "password"): appParams.token se calculaba UNA sola vez al cargar este
// módulo, así que para un visitante anónimo quedaba en null para siempre en
// memoria. base44.auth.loginViaEmailPassword() (LoginScreen.jsx) sí guarda
// el token nuevo en localStorage bajo la misma clave "base44_access_token"
// (ver saveAccessToken en @base44/sdk), pero sin recargar la página nada
// releía ese localStorage — checkAppState() (AuthContext.jsx) seguía viendo
// appParams.token === null y con el "if (appParams.token)" mandaba otra vez
// a LoginScreen, como si el login nunca hubiera pasado. El flujo nativo
// (nativeAuth.js) no tenía este problema porque hace `appParams.token =
// token` a mano tras el callback — aquí convertimos "token" en un getter/
// setter que lee y escribe siempre el localStorage real, así cualquier
// login (web o nativo, actual o futuro) queda reflejado al instante sin
// depender de que cada sitio de la app recuerde sincronizarlo a mano.
Object.defineProperty(appParams, 'token', {
		get() {
					if (isNode) return null;
					return storage.getItem('base44_access_token');
		},
		set(value) {
					if (isNode) return;
					if (value) {
									storage.setItem('base44_access_token', value);
									storage.setItem('token', value);
					} else {
									storage.removeItem('base44_access_token');
					}
		},
		enumerable: true,
		configurable: true,
});
