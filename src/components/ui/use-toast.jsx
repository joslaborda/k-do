// Inspired by react-hot-toast library
import { useState, useEffect } from "react";

// Antes TOAST_LIMIT era 20 y TOAST_REMOVE_DELAY ~16 minutos — los toasts
// básicamente no se cerraban solos nunca, se iban apilando, y el botón de
// cerrar tampoco hacía nada (ver ToastClose en toast.jsx). Resultado: se
// quedaban ahí tapando la pantalla hasta recargar. Ahora cada toast se
// autocierra a los DEFAULT_TOAST_DURATION ms (ver toast() más abajo);
// TOAST_REMOVE_DELAY es solo el tiempo que tarda en desmontarse del DOM una
// vez ya está "cerrado" (para que la animación de salida no se corte), y
// TOAST_LIMIT baja a 3 para que nunca se amontonen aunque algo dispare
// varios seguidos.
const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 300;
const DEFAULT_TOAST_DURATION = 4500;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const _clearFromRemoveQueue = (toastId) => {
  const timeout = toastTimeouts.get(toastId);
  if (timeout) {
    clearTimeout(timeout);
    toastTimeouts.delete(toastId);
  }
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners = [];

let memoryState = { toasts: [] };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({ duration = DEFAULT_TOAST_DURATION, ...props }) {
  // Si ya hay un toast idéntico (mismo título+descripción) abierto ahora
  // mismo, no se apila otro encima — evita el caso típico de un doble tap
  // disparando la misma acción dos veces y mostrando el mismo aviso repetido.
  const dup = memoryState.toasts.find(
    (t) => t.open && t.title === props.title && t.description === props.description
  );
  if (dup) {
    return {
      id: dup.id,
      dismiss: () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: dup.id }),
      update: (p) => dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...p, id: dup.id } }),
    };
  }

  const id = genId();

  const update = (props) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });

  const dismiss = () =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Autocierre — antes esto no existía y el toast se quedaba para siempre
  // si el usuario no lograba tocar el botón de cerrar (que además estaba
  // roto, ver toast.jsx/toaster.jsx).
  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast }; 