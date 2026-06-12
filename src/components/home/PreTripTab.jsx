import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Check, Users } from 'lucide-react';
import { COUNTRY_REQUIREMENTS } from '@/lib/packingDB';
import { getHolidaysInRange } from '@/lib/holidaysDB';
import { getVisaInfo } from '@/lib/visaMatrix';
import { getCountryMeta } from '@/lib/countryConfig';
import { REQ_ICON_MAP } from './constants';
import MemberAvatarRow from './MemberAvatarRow';

function buildRequirements(countries, originCountry, secondNationality = null) {
  const requirements = [];
  const originISO = getCountryMeta(originCountry)?.iso || originCountry;
  const secondISO = secondNationality ? getCountryMeta(secondNationality)?.iso : null;

  countries.forEach(country => {
    const countryData = COUNTRY_REQUIREMENTS[country];
    if (!countryData) return;
    const destISO = getCountryMeta(country)?.iso || country;

    // Visa
    const visaInfo = getVisaInfo(destISO, originISO);
    const secondary = secondISO ? getVisaInfo(destISO, secondISO) : null;
    const best = (secondary && secondary.needed === false) ? secondary : visaInfo;
    requirements.push({
      id: `visa-${country}`, type: 'visa', country,
      origin: originCountry,
      title: best?.needed === false ? `Sin visado — ${country}` : `Visado requerido — ${country}`,
      description: best?.notes || countryData.visa?.info || '',
      level: best?.needed === true ? 'required' : (best?.needed === false ? 'ok' : 'info'),
    });

    // Adapter
    if (countryData.adapter?.needed !== false) {
      requirements.push({
        id: `tech-${country}`, type: 'tech', country,
        title: `Adaptador — ${countryData.adapter?.type || 'revisar tipo'}`,
        description: countryData.adapter?.info || '',
        level: 'info',
      });
    }

    // Vaccines
    if (countryData.vaccines?.length) {
      const required = countryData.vaccines.filter(v => v.priority === 'obligatoria para entrada');
      const recommended = countryData.vaccines.filter(v => v.priority !== 'obligatoria para entrada');
      if (required.length) {
        requirements.push({
          id: `vaccine-req-${country}`, type: 'vaccine', country,
          title: `Vacunas obligatorias — ${country}`,
          description: required.map(v => v.name).join(', '),
          level: 'required',
        });
      }
      if (recommended.length) {
        requirements.push({
          id: `vaccine-rec-${country}`, type: 'vaccine', country,
          title: `Vacunas recomendadas — ${country}`,
          description: recommended.slice(0, 3).map(v => v.name).join(', '),
          level: 'info',
        });
      }
    }

    // Currency
    if (countryData.currency?.info) {
      requirements.push({
        id: `money-${country}`, type: 'money', country,
        title: `Divisa — ${country}`,
        description: countryData.currency.info,
        level: 'info',
      });
    }

    // Tips
    if (countryData.tips?.length) {
      requirements.push({
        id: `safety-${country}`, type: 'safety', country,
        title: `Consejos — ${country}`,
        description: countryData.tips.slice(0, 2).join(' · '),
        level: 'info',
      });
    }
  });
  return requirements;
}

export default function PreTripTab({ trip, cities, packingItems, documents, myProfile, profiles, onInvite, currentUserEmail }) {
  const tripId = trip?.id;
  const originCountry = myProfile?.home_country || 'España';
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`kodo_checklist_${tripId}`) || '{}'); } catch { return {}; }
  });

  const allCountries = useMemo(() => {
    const norm = (c) => (c || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const seen = {};
    const all = cities.length > 0 ? cities.map(c => c.country).filter(Boolean) : [trip?.country].filter(Boolean);
    all.forEach(c => { const key = norm(c); if (!seen[key]) seen[key] = c; });
    return Object.values(seen);
  }, [trip, cities]);

  const requirements = useMemo(() =>
    buildRequirements([...allCountries], originCountry, myProfile?.second_nationality || null),
    [allCountries, originCountry]
  );

  const toggleCheck = (id) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    try { localStorage.setItem(`kodo_checklist_${tripId}`, JSON.stringify(next)); } catch {}
  };

  const visaReqs      = requirements.filter(r => r.type === 'visa');
  const actionableReqs = requirements.filter(r => r.level !== 'ok');
  const displayReqs   = [...visaReqs, ...actionableReqs.filter(r => r.type !== 'visa')];
  const doneCount     = displayReqs.filter(r => r.level !== 'ok' && checkedItems[r.id]).length;
  const packedCount   = packingItems.filter(i => i.packed).length;
  const packedPct     = packingItems.length ? Math.round(packedCount / packingItems.length * 100) : 0;
  const docsCount     = documents?.length || 0;

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const tripStart = trip?.start_date ? parseISO(trip.start_date) : null;
  const daysLeft  = tripStart ? differenceInDays(tripStart, new Date()) : null;

  return (
    <div className="space-y-3">
      {daysLeft !== null && daysLeft >= 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-5xl font-semibold text-primary leading-none">{daysLeft}</p>
          <p className="text-sm text-muted-foreground mt-1">días para el viaje</p>
          {sortedCities.length > 0 && (
            <p className="text-xs text-primary mt-2">
              Primera parada: {sortedCities[0].name}
              {trip?.start_date && ` · ${format(parseISO(trip.start_date), 'dd MMM yyyy', { locale: es })}`}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to={createPageUrl('Utilities') + '?trip_id=' + tripId + '&tab=maleta'}>
          <div className="bg-card rounded-2xl border border-border p-4 hover:border-primary/40 transition-colors">
            <p className="text-xs text-muted-foreground mb-1">Maleta</p>
            <p className="text-2xl font-semibold text-foreground">{packedPct}%</p>
            <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: packedPct + '%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{packedCount}/{packingItems.length} items</p>
          </div>
        </Link>
        <Link to={createPageUrl('Documents') + '?trip_id=' + tripId}>
          <div className="bg-card rounded-2xl border border-border p-4 hover:border-primary/40 transition-colors">
            <p className="text-xs text-muted-foreground mb-1">Documentos</p>
            <p className="text-2xl font-semibold text-foreground">{docsCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{docsCount === 0 ? 'Ninguno subido' : `${docsCount} subido${docsCount > 1 ? 's' : ''}`}</p>
          </div>
        </Link>
      </div>

      {displayReqs.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Por hacer antes del viaje</p>
              <p className="text-xs text-muted-foreground mt-0.5">pasaporte de {originCountry}</p>
            </div>
            {doneCount === displayReqs.filter(r => r.level !== 'ok').length && displayReqs.filter(r => r.level !== 'ok').length > 0 ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Todo listo</span>
            ) : (displayReqs.filter(r => r.level !== 'ok').length - doneCount) > 0 ? (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                {displayReqs.filter(r => r.level === 'required' && !checkedItems[r.id]).length > 0
                  ? `${displayReqs.filter(r => r.level === 'required' && !checkedItems[r.id]).length} pendiente${displayReqs.filter(r => r.level === 'required' && !checkedItems[r.id]).length > 1 ? 's' : ''}`
                  : null}
              </span>
            ) : null}
          </div>
          {(() => {
            const GROUPS = [
              { key: 'visa',    label: 'Visados',      types: ['visa'] },
              { key: 'vaccine', label: 'Salud',        types: ['vaccine'] },
              { key: 'tech',    label: 'Equipamiento', types: ['tech'] },
              { key: 'money',   label: 'Dinero',       types: ['money'] },
              { key: 'safety',  label: 'Consejos',     types: ['safety', 'info'] },
            ];
            return GROUPS.map(group => {
              const items = displayReqs.filter(r => group.types.includes(r.type));
              if (!items.length) return null;
              const allDone = items.filter(r => checkedItems[r.id]).length === items.length;
              const isCollapsed = collapsedGroups[group.key] ?? allDone;
              return (
                <div key={group.key}>
                  <button onClick={() => setCollapsedGroups(p => ({ ...p, [group.key]: !isCollapsed }))}
                    className="w-full flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <p className="text-label font-semibold text-foreground/70 uppercase tracking-wider">{group.label}</p>
                      {allDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={"text-muted-foreground transition-transform " + (isCollapsed ? '' : 'rotate-180')}>
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  {!isCollapsed && items.map(req => {
                    const isInfo = req.level === 'info';
                    const isOk   = req.level === 'ok';
                    if (isOk) return (
                      <div key={req.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                        <span className="text-base shrink-0">{REQ_ICON_MAP[req.type] ? REQ_ICON_MAP[req.type]({className:'text-green-600'}) : null}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">{req.origin} → {req.country}</p>
                          {req.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{req.description}</p>}
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0 border border-green-200">Sin visado</span>
                      </div>
                    );
                    return !isInfo ? (
                      <button key={req.id} onClick={() => toggleCheck(req.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors text-left">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checkedItems[req.id] ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                          {checkedItems[req.id] && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-base shrink-0">{REQ_ICON_MAP[req.type] ? REQ_ICON_MAP[req.type]({className:'text-primary'}) : null}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-tight ${checkedItems[req.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{req.title}</p>
                          {req.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{req.description}</p>}
                        </div>
                        {req.level === 'required' && !checkedItems[req.id] && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">!</span>
                        )}
                      </button>
                    ) : (
                      <div key={req.id} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
                        <span className="text-base shrink-0 mt-0.5">{REQ_ICON_MAP[req.type] ? REQ_ICON_MAP[req.type]({className:'text-muted-foreground'}) : 'ℹ️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">{req.title}</p>
                          {req.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{req.description}</p>}
                        </div>
                        <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-medium shrink-0 border border-amber-100">recomendado</span>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>
      )}

      {(() => {
        if (!trip?.start_date || !trip?.end_date) return null;
        const countryList = [...new Set(sortedCities.map(c => c.country).filter(Boolean))];
        const tripHolidays = getHolidaysInRange(countryList, trip.start_date, trip.end_date, sortedCities);
        if (!tripHolidays.length) return null;
        return (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center"><Calendar size={11} className="text-amber-700" /></span>
                Festivos en tu viaje
              </p>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40">
                {tripHolidays.length} día{tripHolidays.length > 1 ? 's' : ''}
              </span>
            </div>
            {tripHolidays.map((h, i) => {
              const d = new Date(h.date + 'T12:00:00');
              const day = d.toLocaleDateString('es-ES', { day: 'numeric' });
              const mon = d.toLocaleDateString('es-ES', { month: 'short' });
              return (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <div className="flex-shrink-0 min-w-[38px] text-center bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-lg py-1.5 px-1">
                    <p className="text-base font-medium text-amber-800 dark:text-amber-300 leading-none">{day}</p>
                    <p className="text-micro text-amber-600 dark:text-amber-500 uppercase tracking-wide mt-1">{mon}</p>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-foreground leading-snug">{h.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {h.city ? h.city : h.country || ''}{(h.city || h.country) && h.scope ? ` · ${h.scope}` : ''}
                    </p>
                    {h.note && <p className="text-xs text-amber-700 dark:text-amber-500 mt-1.5 pl-2 border-l-2 border-amber-300 dark:border-amber-700 leading-relaxed">{h.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />Viajeros
          </p>
        </div>
        <MemberAvatarRow trip={trip} profiles={profiles} onInvite={onInvite} currentUserEmail={currentUserEmail} />
      </div>
    </div>
  );
}
