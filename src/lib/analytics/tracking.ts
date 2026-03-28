/**
 * Servicio de Analíticas para Sitios Satélite
 * 
 * Este módulo proporciona funciones para trackear eventos en los sitios satélite
 * y almacenarlos en la tabla site_analytics de Supabase.
 */

import { createClient } from "@/lib/supabase/client";

export type EventType = 
  | "page_view"
  | "property_view"
  | "lead_form_submit"
  | "contact_click"
  | "phone_click"
  | "whatsapp_click";

export interface TrackingEvent {
  siteId: string;
  eventType: EventType;
  pageUrl?: string;
  propertyId?: number;
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType?: "mobile" | "desktop" | "tablet";
  metadata?: Record<string, unknown>;
}

/**
 * Trackea un evento en el sitio satélite
 */
export async function trackEvent(event: TrackingEvent) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("site_analytics")
      .insert({
        site_id: event.siteId,
        event_type: event.eventType,
        page_url: event.pageUrl,
        property_id: event.propertyId,
        visitor_id: event.visitorId,
        session_id: event.sessionId,
        referrer: event.referrer,
        user_agent: event.userAgent,
        ip_address: event.ipAddress,
        country: event.country,
        city: event.city,
        device_type: event.deviceType,
        metadata: event.metadata || {},
      });

    if (error) {
      console.error("Error tracking event:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error tracking event:", error);
    return { success: false, error };
  }
}

/**
 * Obtiene las métricas de un sitio para un rango de fechas
 */
export async function getSiteMetrics(
  siteId: string,
  startDate: Date,
  endDate: Date
) {
  const supabase = createClient();

  try {
    // Obtener métricas agregadas diarias
    const { data: dailyMetrics, error: dailyError } = await supabase
      .from("site_metrics_daily")
      .select("*")
      .eq("site_id", siteId)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (dailyError) {
      console.error("Error fetching daily metrics:", dailyError);
      return { success: false, error: dailyError };
    }

    // Calcular totales
    const totals = dailyMetrics?.reduce(
      (acc, day) => ({
        totalVisits: acc.totalVisits + (day.total_visits || 0),
        uniqueVisitors: acc.uniqueVisitors + (day.unique_visitors || 0),
        totalLeads: acc.totalLeads + (day.total_leads || 0),
        propertyViews: acc.propertyViews + (day.property_views || 0),
      }),
      { totalVisits: 0, uniqueVisitors: 0, totalLeads: 0, propertyViews: 0 }
    );

    return {
      success: true,
      data: {
        dailyMetrics,
        totals,
      },
    };
  } catch (error) {
    console.error("Error fetching site metrics:", error);
    return { success: false, error };
  }
}

/**
 * Obtiene las propiedades más vistas de un sitio
 */
export async function getTopProperties(
  siteId: string,
  limit: number = 10
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("site_analytics")
      .select("property_id, count")
      .eq("site_id", siteId)
      .eq("event_type", "property_view")
      .not("property_id", "is", null)
      .order("count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching top properties:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching top properties:", error);
    return { success: false, error };
  }
}

/**
 * Obtiene los referrers principales de un sitio
 */
export async function getTopReferrers(
  siteId: string,
  limit: number = 10
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("site_analytics")
      .select("referrer, count")
      .eq("site_id", siteId)
      .not("referrer", "is", null)
      .order("count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching top referrers:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching top referrers:", error);
    return { success: false, error };
  }
}

/**
 * Genera un ID único para el visitante (fingerprint simple)
 */
export function generateVisitorId(): string {
  const stored = localStorage.getItem("homepty_visitor_id");
  if (stored) return stored;

  const id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem("homepty_visitor_id", id);
  return id;
}

/**
 * Genera un ID único para la sesión
 */
export function generateSessionId(): string {
  const stored = sessionStorage.getItem("homepty_session_id");
  if (stored) return stored;

  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem("homepty_session_id", id);
  return id;
}

/**
 * Detecta el tipo de dispositivo
 */
export function detectDeviceType(): "mobile" | "desktop" | "tablet" {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}
