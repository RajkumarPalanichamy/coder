"use client";
import { useCallback, useEffect, useRef, useState } from 'react';

/** Vendor-prefixed fullscreen helpers - Safari and older Edge still need these. */
export function getFullscreenElement() {
  if (typeof document === 'undefined') return null;
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
}

export function requestFullscreen(element = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!element) return Promise.resolve(false);
  const request =
    element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
  if (!request) return Promise.resolve(false);
  // Must be called from a user gesture or the browser rejects it.
  return Promise.resolve(request.call(element)).then(() => true).catch(() => false);
}

export function exitFullscreen() {
  if (!getFullscreenElement()) return Promise.resolve();
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (!exit) return Promise.resolve();
  return Promise.resolve(exit.call(document)).catch(() => {});
}

const FULLSCREEN_EVENTS = ['fullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'];

/**
 * Locks a student into the test screen for the duration of an attempt.
 *
 * Enforces three things while `active`:
 *  - Fullscreen. The caller renders a blocking overlay whenever `isFullscreen` is false,
 *    so the questions are never readable outside fullscreen.
 *  - Presence. Once fullscreen has been entered, leaving it or backgrounding the tab fires
 *    `onViolation` exactly once, which the caller turns into an immediate auto-submit.
 *  - Paste. Ctrl/Cmd+V, the paste event, right-click paste and drag-drop are all blocked.
 *    Copy (Ctrl+C) and undo (Ctrl+Z) are deliberately left working.
 *
 * `onViolation` is latched: it fires at most once per activation, so the submit it triggers
 * cannot be re-entered by the follow-on events that a single tab switch usually produces.
 */
export default function useTestProctoring({ active, onViolation }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // `armed` mirrors armedRef for rendering: false means fullscreen was never reached, so no
  // question has ever been on screen and abandoning costs the student nothing.
  const [armed, setArmed] = useState(false);
  const violatedRef = useRef(false);
  const armedRef = useRef(false);
  const armedAtRef = useRef(0);
  const onViolationRef = useRef(onViolation);

  // Keep the callback fresh without re-binding every listener on each render.
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  const enterFullscreen = useCallback(() => requestFullscreen(), []);

  const reportViolation = useCallback((reason) => {
    if (violatedRef.current) return;
    violatedRef.current = true;
    onViolationRef.current?.(reason);
  }, []);

  // Reset the latch whenever a new attempt starts.
  useEffect(() => {
    if (active) {
      violatedRef.current = false;
      armedRef.current = false;
      setArmed(false);
    }
  }, [active]);

  // Fullscreen tracking. Violations only arm after fullscreen has actually been entered,
  // so the async gap between the Start click and the browser honouring the request is not
  // mistaken for the student escaping the test.
  useEffect(() => {
    if (!active) return undefined;

    const syncFullscreen = () => {
      const inFullscreen = !!getFullscreenElement();
      setIsFullscreen(inFullscreen);

      if (inFullscreen) {
        if (!armedRef.current) armedAtRef.current = Date.now();
        armedRef.current = true;
        setArmed(true);
      } else if (armedRef.current) {
        reportViolation('exited_fullscreen');
      }
    };

    syncFullscreen();
    FULLSCREEN_EVENTS.forEach((event) => document.addEventListener(event, syncFullscreen));
    return () => FULLSCREEN_EVENTS.forEach((event) => document.removeEventListener(event, syncFullscreen));
  }, [active, reportViolation]);

  // Leaving the test screen without exiting fullscreen: tab switch, window switch, minimise.
  useEffect(() => {
    if (!active) return undefined;

    // Entering fullscreen briefly blurs the window on some platforms. Focus loss in the
    // moment right after the transition is that artefact, not the student leaving, so it is
    // ignored. A deliberate fullscreen exit is never covered by this - that path is separate.
    const settledAfterArming = () => armedRef.current && Date.now() - armedAtRef.current > 750;

    const handleHidden = () => {
      if (document.visibilityState === 'hidden' && settledAfterArming()) {
        reportViolation('left_test_screen');
      }
    };
    const handleBlur = () => {
      if (settledAfterArming()) {
        reportViolation('left_test_screen');
      }
    };

    document.addEventListener('visibilitychange', handleHidden);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleHidden);
      window.removeEventListener('blur', handleBlur);
    };
  }, [active, reportViolation]);

  // Paste lockdown. Copy and undo stay available by design.
  useEffect(() => {
    if (!active) return undefined;

    const block = (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    const handleKeyDown = (event) => {
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key?.toLowerCase();

      // Ctrl/Cmd+V and the Shift+Insert paste alias.
      if ((modifier && key === 'v') || (event.shiftKey && key === 'insert')) {
        block(event);
      }
    };

    document.addEventListener('paste', block, true);
    document.addEventListener('drop', block, true);
    document.addEventListener('dragover', block, true);
    document.addEventListener('contextmenu', block, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('paste', block, true);
      document.removeEventListener('drop', block, true);
      document.removeEventListener('dragover', block, true);
      document.removeEventListener('contextmenu', block, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [active]);

  // Neutralise the back button. A client-side route change fires no beforeunload, so the
  // entry is re-pushed to keep the student on the page while the auto-submit runs.
  useEffect(() => {
    if (!active) return undefined;

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      if (armedRef.current) {
        reportViolation('left_test_screen');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [active, reportViolation]);

  // Native "leave site?" prompt for a reload or a closed tab.
  useEffect(() => {
    if (!active) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [active]);

  return { isFullscreen, armed, enterFullscreen };
}
