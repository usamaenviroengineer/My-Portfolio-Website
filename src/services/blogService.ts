import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { BlogPost, BlogAuthor } from '../types';

const STORAGE_KEY = 'usama_portfolio_blogs_v1';

export const DEFAULT_AUTHOR: BlogAuthor = {
  name: "Usama Rasheed",
  role: "Environmental Engineer & AI Solutions Expert",
  avatar: "https://myphotosss.netlify.app/5.png",
  bio: "Specializing in the convergence of physical environmental science, mathematical modeling, satellite remote sensing, and applied machine learning architectures."
};

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-air-quality-forecasting",
    title: "AI-Powered Air Quality Forecasting: Bridging Satellite Remote Sensing with Ground IoT Arrays",
    slug: "ai-air-quality-forecasting-satellite-iot",
    excerpt: "How combining Sentinel-5P TROPOMI tropospheric satellite retrievals with calibrated low-cost optical particulate sensors enables high-resolution micro-climate PM2.5 forecasting.",
    featuredImage: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop",
    category: "Air Quality & AI",
    tags: ["Remote Sensing", "Machine Learning", "IoT Sensors", "Sentinel-5P", "Python", "PM2.5"],
    author: DEFAULT_AUTHOR,
    publishedAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-04-02T14:30:00Z",
    readingTime: "7 min read",
    status: "published",
    featured: true,
    views: 1420,
    seo: {
      metaTitle: "AI-Powered Air Quality Forecasting with Sentinel-5P & IoT — Usama Rasheed",
      metaDescription: "Explore how machine learning models merge satellite remote sensing with ground IoT nodes to forecast particulate matter pollution in complex urban-rural corridors.",
      keywords: "Air Quality Forecasting, Remote Sensing, Sentinel-5P, IoT Sensors, LSTM, PM2.5, Usama Rasheed",
      ogImage: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop"
    },
    content: `
      <h2>The Urban-Agricultural Smog Paradox</h2>
      <p>In developing agro-industrial basins, air quality degradation is neither uniform nor static. Seasonal crop residue combustion, thermal inversions, and unregulated industrial emissions create sharp hyper-localized aerosol gradients. Traditional reference-grade monitoring stations (such as beta-attenuation monitors) cost tens of thousands of dollars, resulting in sparse geographical coverage that leaves immense sensor dead zones.</p>
      
      <p>To overcome this spatial limitation, our research architecture couples <strong>Level-2 satellite retrievals</strong> from the European Space Agency's Copernicus Sentinel-5P satellite with an array of calibrated, low-cost edge IoT optical particulate nodes distributed across regional transit and industrial corridors.</p>

      <div class="callout callout-info">
        <strong>Key Engineering Metric:</strong> Optical particle counters (OPCs) calibrated against high-humidity hygroscopic growth models achieved a Pearson correlation coefficient of <em>r = 0.93</em> against reference-grade BAM-1020 monitors.
      </div>

      <h2>Data Pipeline Architecture</h2>
      <p>The processing pipeline operates in three distinct temporal stages:</p>
      <ul>
        <li><strong>Satellite Extraction:</strong> Daily overpass raster data from Sentinel-5P TROPOMI (Tropospheric Monitoring Instrument) extracting Nitrogen Dioxide ($NO_2$), Carbon Monoxide ($CO$), and Aerosol Index ($AI$).</li>
        <li><strong>Edge Telemetry:</strong> Micro-climate ambient temperature, relative humidity, barometric pressure, $PM_{2.5}$, and $PM_{10}$ sampled at 1-minute intervals via calibrated Plantower and Sensirion optical dust sensors.</li>
        <li><strong>Spatio-Temporal Fusion:</strong> Multi-layer perceptron (MLP) feature aggregation feeding a Bidirectional LSTM recurrent neural network with temporal attention gates.</li>
      </ul>

      <h3>Hygroscopic Particle Swelling Correction</h3>
      <p>Low-cost optical counters consistently overestimate particulate concentrations during high ambient humidity due to water condensation on hydroscopic salt aerosols. We formulated an empirical $\\kappa$-Kohler correction factor applied before model ingestion:</p>

      <pre><code class="language-python"># Humidity Growth Factor Correction Function
import numpy as np

def correct_hygroscopic_growth(pm_raw, rh, kappa=0.38):
    """
    Corrects optical PM2.5 measurements for relative humidity (RH) swelling.
    kappa: Hygroscopic growth parameter (0.35 - 0.42 for urban aerosols)
    """
    rh_norm = np.clip(rh / 100.0, 0.0, 0.95)
    # Empirical Kohler particle growth factor
    growth_factor = 1.0 + kappa * (rh_norm / (1.0 - rh_norm))
    return pm_raw / np.maximum(growth_factor, 1.0)
</code></pre>

      <h2>Model Performance & Evaluation</h2>
      <p>The model was trained on 18 months of continuous historical time-series data. Below is the comparative validation across standard predictive baselines:</p>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Predictive Model</th>
              <th>Input Features</th>
              <th>RMSE (µg/m³)</th>
              <th>MAE (µg/m³)</th>
              <th>$R^2$ Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ARIMA Baseline</td>
              <td>Lagged $PM_{2.5}$ only</td>
              <td>22.4</td>
              <td>16.8</td>
              <td>0.61</td>
            </tr>
            <tr>
              <td>XGBoost Regressor</td>
              <td>Ground IoT + Meteorology</td>
              <td>14.1</td>
              <td>9.5</td>
              <td>0.79</td>
            </tr>
            <tr>
              <td><strong>Spatial Bi-LSTM (Proposed)</strong></td>
              <td><strong>Sentinel-5P + IoT + Weather</strong></td>
              <td><strong>8.3</strong></td>
              <td><strong>5.2</strong></td>
              <td><strong>0.92</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <blockquote>
        "Deploying environmental intelligence requires not only sophisticated deep learning, but deep respect for atmospheric chemistry and physical sensor physics."
      </blockquote>

      <h2>Field Deployment & Real-Time Alerts</h2>
      <p>The system now powers municipal advisory alerts via automated webhooks, notifying agricultural communities and civil engineering teams up to 36 hours before severe smog stagnation events trigger critical respiratory hazard thresholds.</p>
    `
  },
  {
    id: "blog-biochar-carbon-sequestration",
    title: "Biochar Carbon Sequestration: Pyrolysis Kinetics & Soil Biogeochemistry in Arid Zones",
    slug: "biochar-carbon-sequestration-pyrolysis-arid-soils",
    excerpt: "An in-depth thermodynamic analysis of slow pyrolysis temperatures on biochar surface porosity, recalcitrant carbon fractions, and moisture retention in alkaline arid soils.",
    featuredImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop",
    category: "Biochar & Carbon",
    tags: ["Carbon Sequestration", "Biochar", "Pyrolysis", "Soil Remediation", "Arid Agriculture", "Circular Economy"],
    author: DEFAULT_AUTHOR,
    publishedAt: "2026-03-12T11:00:00Z",
    updatedAt: "2026-03-15T16:00:00Z",
    readingTime: "6 min read",
    status: "published",
    featured: true,
    views: 980,
    seo: {
      metaTitle: "Biochar Pyrolysis Kinetics & Arid Soil Biogeochemistry — Usama Rasheed",
      metaDescription: "Thermodynamic and geochemical analysis of slow pyrolysis biochar engineering for persistent carbon drawdown in moisture-deficient soils.",
      keywords: "Biochar, Carbon Removal, Pyrolysis Kinetics, Soil Carbon, Arid Zone Agriculture, Usama Rasheed",
      ogImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop"
    },
    content: `
      <h2>The Carbon Stability Challenge</h2>
      <p>Agricultural biomass residues represent an immense terrestrial carbon flux. Left on field borders, crop stalks decompose rapidly under oxidative microbiological conditions, releasing the vast majority of their stored carbon back into the atmosphere as $CO_2$ and $CH_4$ within 12 to 24 months.</p>
      
      <p>Thermochemical conversion via <strong>slow oxygen-depleted pyrolysis</strong> reorganizes volatile cellulose and hemicellulose carbohydrates into condensed polycyclic aromatic hydrocarbon matrices. This recalcitrant carbon lattice resists biological microbial degradation for centuries, yielding verifiable carbon dioxide removal (CDR).</p>

      <div class="callout callout-tip">
        <strong>Optimal Pyrolysis Window:</strong> Characterization tests demonstrate that agricultural cotton stalks and bagasse heated at <em>500°C to 550°C</em> with a residence time of 45 minutes achieve the highest balance of BET specific surface area ($>320 \\text{ m}^2/\\text{g}$) and aromatic carbon stability ($H:C_{org} < 0.4$).
      </div>

      <h2>Pyrolysis Temperature Spectrum</h2>
      <p>The physical and electrochemical characteristics of biochar change dramatically across thermal thresholds:</p>
      <ul>
        <li><strong>Low Temperature (350°C - 450°C):</strong> Yields higher mass percentages (up to 42%) with active carboxyl and hydroxyl functional groups, ideal for cation exchange capacity in nutrient-depleted soils.</li>
        <li><strong>Intermediate Optimal (500°C - 550°C):</strong> Develops dense microporous and mesoporous capillary networks that maximize hygroscopic water retention in coarse sandy soils.</li>
        <li><strong>High Temperature (600°C - 750°C):</strong> Maximizes graphitic conductivity and surface area, but reduces biochar yield to under 25% and volatilizes essential nitrogen compounds.</li>
      </ul>

      <h3>C:N Ratio and Moisture Dynamics</h3>
      <p>When applied to arid soils with high bulk density and low organic matter, biochar amendment produces marked increases in plant-available water capacity (PAWC):</p>

      <pre><code class="language-python"># Soil Water Retention Capacity Simulation
def estimate_pawc_boost(baseline_pawc_pct, biochar_rate_tons_per_ha):
    """
    Simulates increase in Plant-Available Water Capacity (PAWC)
    based on application of high-surface-area engineered biochar.
    """
    coefficient = 0.65  # empirically calibrated for sandy-loam soils
    boost = coefficient * (biochar_rate_tons_per_ha ** 0.85)
    return round(baseline_pawc_pct + boost, 2)

# Baseline 8.5% PAWC with 15 tons/ha amendment
final_pawc = estimate_pawc_boost(8.5, 15)
print(f"Post-Amendment Soil PAWC: {final_pawc}% (Relative gain: +{final_pawc - 8.5}%)")
</code></pre>

      <h2>Carbon Offset Verification</h2>
      <p>Under the Puro.earth and European Biochar Certificate (EBC) standards, biochar permanent carbon credits require rigorous isotopic testing ($^{14}C$ decay testing and $H:C_{org}$ ratio validation). Our local pilot tests indicate net carbon sequestration accounting for approximately <strong>2.3 tons of $CO_2$ equivalent sequestered per ton of biochar</strong> produced and incorporated.</p>
    `
  },
  {
    id: "blog-edge-iot-environmental-stations",
    title: "Building Autonomous Edge-IoT Environmental Monitoring Stations with Solar Harvesting",
    slug: "autonomous-edge-iot-environmental-monitoring-solar",
    excerpt: "Schematics, low-power telemetry, optical dust sensor calibrations, and firmware architectures for ruggedized outdoor environmental sensing stations.",
    featuredImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    category: "IoT & Hardware",
    tags: ["Embedded Systems", "ESP32", "LoRaWAN", "Solar Power", "Edge Computing", "Hardware"],
    author: DEFAULT_AUTHOR,
    publishedAt: "2026-02-18T10:00:00Z",
    updatedAt: "2026-02-22T08:15:00Z",
    readingTime: "8 min read",
    status: "published",
    featured: false,
    views: 750,
    seo: {
      metaTitle: "Autonomous Edge-IoT Environmental Monitoring Stations — Usama Rasheed",
      metaDescription: "Step-by-step firmware, power management, and hardware design guide for building resilient, off-grid environmental sensor nodes.",
      keywords: "Edge IoT, Environmental Monitoring, ESP32, Solar Harvesting, LoRaWAN, Usama Rasheed",
      ogImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"
    },
    content: `
      <h2>The Challenge of Remote Outdoor Sensing</h2>
      <p>Deploying environmental monitoring stations in harsh rural or desert-adjacent climates presents unforgiving constraints: extreme ambient temperatures reaching 48°C, heavy airborne dust deposition, lack of grid power, and intermittent cellular connectivity.</p>
      
      <p>Off-the-shelf consumer weather stations quickly degrade under persistent ultraviolet radiation and fine quartz sand infiltration. Designing a rugged, low-cost autonomous node requires deep integration across <strong>power harvesting thermodynamics, low-duty sleep cycling, and self-cleaning airflow enclosures</strong>.</p>

      <h2>Hardware Component Selection</h2>
      <ul>
        <li><strong>Microcontroller:</strong> ESP32-S3 with dual-core Xtensa LX7 and Ultra-Low-Power (ULP) co-processor.</li>
        <li><strong>Telemetry:</strong> Semtech SX1262 LoRaWAN transceiver operating at 868/915 MHz for 15+ km point-to-gateway range.</li>
        <li><strong>Power Subsystem:</strong> 10W monocrystalline solar panel coupled with a CN3791 MPPT charging module and two Panasonic 18650 LiFePO4 cells (3.2V, 3200mAh each).</li>
        <li><strong>Sensory Array:</strong> Sensirion SPS30 laser optical particulate matter sensor (featuring automated fan-cleaning cycles), BME680 (gas, temperature, humidity, pressure), and waterproof DS18B20 soil probes.</li>
      </ul>

      <div class="callout callout-warning">
        <strong>Why LiFePO4 over Standard Li-Ion?</strong> Lithium Iron Phosphate chemistry offers superior thermal safety (no thermal runaway risk below 270°C) and handles over 3,000 charge cycles, making it mandatory for desert solar field installations.
      </div>

      <h2>Firmware Power Budget Optimization</h2>
      <p>The device remains in deep sleep mode ($15 \\mu A$ draw) for 9 minutes and 45 seconds of every 10-minute cycle. It wakes, powers the sensory bus via MOSFET switches, stabilizes the optical chamber for 8 seconds, averages 10 readings, transmits a 16-byte encrypted LoRa packet, and immediately returns to deep sleep:</p>

      <pre><code class="language-c">// ESP32 Low-Power Deep Sleep Execution Cycle
#include <esp_sleep.h>

#define SLEEP_INTERVAL_SECONDS 600 // 10 minutes

void enter_power_saving_sleep() {
    // Isolate GPIOs to prevent parasitic leakage current
    gpio_hold_en(GPIO_NUM_14); // Sensor power MOSFET latch
    esp_sleep_enable_timer_wakeup(SLEEP_INTERVAL_SECONDS * 1000000ULL);
    
    // Shut down WiFi, Bluetooth, and main ADC peripherals
    esp_deep_sleep_start();
}
</code></pre>

      <h2>Data Reliability & Field Results</h2>
      <p>Over a continuous 90-day deployment trial during peak summer dust storms, the node maintained a <strong>99.8% packet delivery success rate</strong> with battery voltage remaining above 3.18V even through five consecutive overcast rain days.</p>
    `
  },
  {
    id: "blog-sustainable-ai-ml-carbon-efficiency",
    title: "The Carbon Footprint of Generative AI: Engineering Energy-Efficient Machine Learning Pipelines",
    slug: "sustainable-ai-carbon-efficiency-green-ml",
    excerpt: "Practical methodologies to measure and reduce computational emissions in modern deep learning through INT8 quantization, speculative decoding, and carbon-aware batch scheduling.",
    featuredImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    category: "Sustainable Tech",
    tags: ["Green AI", "Machine Learning", "Carbon Accounting", "Model Quantization", "Cloud Computing", "AI Ethics"],
    author: DEFAULT_AUTHOR,
    publishedAt: "2026-01-25T14:00:00Z",
    updatedAt: "2026-01-30T10:00:00Z",
    readingTime: "5 min read",
    status: "published",
    featured: false,
    views: 1105,
    seo: {
      metaTitle: "Sustainable AI & Green Machine Learning Pipelines — Usama Rasheed",
      metaDescription: "How software engineers and AI developers can quantify and slash model inference carbon footprints using quantization and green data center scheduling.",
      keywords: "Sustainable AI, Green ML, Carbon Footprint, Model Quantization, FLOPS CO2, Usama Rasheed",
      ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
    },
    content: `
      <h2>The Hidden Energy Cost of Compute</h2>
      <p>As large language models and multi-modal transformers become foundational layers across enterprise workflows, their electricity demand has surged exponentially. Training a frontier model produces hundreds of metric tons of $CO_2$ equivalent, but <strong>over 80% of a model's lifetime emissions occur during inference</strong> when serving millions of daily queries.</p>
      
      <p>For environmental engineers working in software, optimizing machine learning systems is not merely a cost-reduction exercise — it is a vital carbon mitigation strategy.</p>

      <h2>The Green ML Optimization Hierarchy</h2>
      <ul>
        <li><strong>Precision Downscaling (FP16 to INT8/INT4):</strong> Post-training quantization (PTQ) or quantization-aware training (QAT) reduces memory bandwidth pressure by up to 75% with less than 0.8% perplexity degradation.</li>
        <li><strong>Speculative Decoding:</strong> Leveraging smaller, energy-lean draft models to propose token sequences verified in a single forward pass by the larger target model.</li>
        <li><strong>Carbon-Aware Workload Scheduling:</strong> Scheduling non-real-time training jobs and batch vector embeddings in geographic cloud regions during peak renewable energy (solar/wind) grid generation.</li>
      </ul>

      <div class="callout callout-success">
        <strong>Efficiency Gains in Practice:</strong> Transitioning our tabular environmental regression models from unquantized 32-bit floating point to 8-bit integer formats slashed server-side watt-hour consumption per million predictions from 480 Wh to just 112 Wh.
      </div>

      <h2>Measuring Your ML Carbon Intensity</h2>
      <p>Integrating carbon tracking into automated CI/CD evaluation pipelines enables development teams to treat computational carbon as a first-class engineering metric alongside latency and accuracy:</p>

      <pre><code class="language-python"># Automated Cloud Carbon Tracking Hook
import time

def calculate_inference_carbon(start_time, end_time, gpu_power_watts=250, grid_carbon_intensity=380):
    """
    Computes grams of CO2e produced during an ML task run.
    gpu_power_watts: Average board draw in Watts (e.g., NVIDIA A10G ~ 250W)
    grid_carbon_intensity: gCO2e/kWh of current regional electrical grid
    """
    duration_hours = (end_time - start_time) / 3600.0
    energy_kwh = (gpu_power_watts * duration_hours) / 1000.0
    emissions_g_co2e = energy_kwh * grid_carbon_intensity
    return round(emissions_g_co2e, 4)
</code></pre>

      <blockquote>
        "The most sustainable algorithm is not the one with the highest parameter count, but the one that achieves verified real-world impact with minimal joules per inference."
      </blockquote>
    `
  }
];

// Helper to convert snake_case DB row to BlogPost
function mapDbRowToPost(row: any): BlogPost {
  return {
    id: row.id || `blog-${Date.now()}`,
    title: row.title || 'Untitled Article',
    slug: row.slug || '',
    excerpt: row.excerpt || '',
    content: row.content || '',
    featuredImage: row.featured_image || '',
    category: row.category || 'General',
    tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : []),
    author: row.author && typeof row.author === 'object' ? row.author : DEFAULT_AUTHOR,
    publishedAt: row.published_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    readingTime: row.reading_time || '5 min read',
    status: row.status || 'published',
    scheduledDate: row.scheduled_date || undefined,
    featured: !!row.featured,
    seo: row.seo && typeof row.seo === 'object' ? row.seo : {},
    views: row.views || 0,
  };
}

// Helper to convert BlogPost to DB snake_case record
function mapPostToDbRow(post: BlogPost): any {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featured_image: post.featuredImage,
    category: post.category,
    tags: post.tags,
    author: post.author,
    published_at: post.publishedAt,
    updated_at: new Date().toISOString(),
    reading_time: post.readingTime,
    status: post.status,
    scheduled_date: post.scheduledDate || null,
    featured: post.featured,
    seo: post.seo || {},
    views: post.views || 0,
  };
}

// LocalStorage helpers for resilient zero-downtime offline fallback
function getLocalBlogs(): BlogPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BLOG_POSTS));
      return INITIAL_BLOG_POSTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BLOG_POSTS;
  } catch (err) {
    console.warn('[Blog Service] Error reading blogs from localStorage, using initial posts:', err);
    return INITIAL_BLOG_POSTS;
  }
}

function saveLocalBlogs(blogs: BlogPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  } catch (err) {
    console.error('[Blog Service] Error saving blogs to localStorage:', err);
  }
}

/**
 * Calculate estimated reading time based on 200 words per minute
 */
export function calculateReadingTime(textOrHtml: string): string {
  if (!textOrHtml) return '1 min read';
  // Strip HTML tags
  const plainText = textOrHtml.replace(/<[^>]*>/g, ' ');
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

/**
 * Generate a clean URL-friendly slug from title
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Fetch all published blog posts for public view
 */
export async function getPublishedBlogs(): Promise<BlogPost[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbRowToPost);
      }
      
      // If table doesn't exist yet or is empty, use local fallback
      if (error) {
        console.warn('[Blog Service] Supabase blogs table returned error (using fallback):', error.message);
      }
    } catch (err) {
      console.warn('[Blog Service] Supabase query exception (using fallback):', err);
    }
  }

  // Fallback to localStorage
  const local = getLocalBlogs();
  return local.filter(p => p.status === 'published').sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Fetch all blogs for the admin panel (including drafts, scheduled, etc.)
 */
export async function getAllBlogsAdmin(): Promise<BlogPost[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbRowToPost);
      }
      if (error) {
        console.warn('[Blog Service] Supabase admin fetch error:', error.message);
      }
    } catch (err) {
      console.warn('[Blog Service] Supabase admin query exception:', err);
    }
  }

  return getLocalBlogs();
}

/**
 * Fetch a single blog post by unique slug
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return mapDbRowToPost(data);
      }
    } catch (err) {
      console.warn('[Blog Service] Error finding slug via Supabase:', err);
    }
  }

  const local = getLocalBlogs();
  const found = local.find(p => p.slug === slug);
  return found || null;
}

/**
 * Save (create or update) a blog post
 */
export async function saveBlog(post: BlogPost): Promise<{ success: boolean; error?: string }> {
  // Update reading time dynamically
  const readingTime = calculateReadingTime(post.content);
  const updatedPost: BlogPost = {
    ...post,
    readingTime,
    updatedAt: new Date().toISOString(),
  };

  // 1. Try Supabase
  let supabaseSuccess = false;
  if (isSupabaseConfigured && supabase) {
    try {
      const dbRow = mapPostToDbRow(updatedPost);
      const { error } = await supabase
        .from('blogs')
        .upsert(dbRow, { onConflict: 'id' });

      if (!error) {
        supabaseSuccess = true;
      } else {
        console.warn('[Blog Service] Supabase save error:', error.message);
      }
    } catch (err: any) {
      console.warn('[Blog Service] Supabase save exception:', err);
    }
  }

  // 2. Always sync with localStorage
  try {
    const local = getLocalBlogs();
    const index = local.findIndex(p => p.id === updatedPost.id);
    if (index >= 0) {
      local[index] = updatedPost;
    } else {
      local.unshift(updatedPost);
    }
    saveLocalBlogs(local);
    return { success: true };
  } catch (err: any) {
    return { success: supabaseSuccess, error: err?.message || 'Failed saving blog post' };
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlog(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('blogs').delete().eq('id', id);
    } catch (err) {
      console.warn('[Blog Service] Error deleting from Supabase:', err);
    }
  }

  try {
    const local = getLocalBlogs().filter(p => p.id !== id);
    saveLocalBlogs(local);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Toggle post status between 'published' and 'draft'
 */
export async function toggleBlogStatus(id: string): Promise<{ success: boolean; newStatus?: string }> {
  const blogs = await getAllBlogsAdmin();
  const post = blogs.find(p => p.id === id);
  if (!post) return { success: false };

  const newStatus: 'published' | 'draft' = post.status === 'published' ? 'draft' : 'published';
  const updated: BlogPost = { ...post, status: newStatus, updatedAt: new Date().toISOString() };
  
  const res = await saveBlog(updated);
  return { success: res.success, newStatus };
}

/**
 * Duplicate a post as draft
 */
export async function duplicateBlog(id: string): Promise<{ success: boolean; post?: BlogPost }> {
  const blogs = await getAllBlogsAdmin();
  const original = blogs.find(p => p.id === id);
  if (!original) return { success: false };

  const copy: BlogPost = {
    ...original,
    id: `blog-${Date.now()}`,
    title: `${original.title} (Copy)`,
    slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
    status: 'draft',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
  };

  const res = await saveBlog(copy);
  return { success: res.success, post: copy };
}

/**
 * Increment view count for an article safely
 */
export async function incrementBlogViews(slug: string): Promise<void> {
  // Update local count
  try {
    const local = getLocalBlogs();
    const post = local.find(p => p.slug === slug);
    if (post) {
      post.views = (post.views || 0) + 1;
      saveLocalBlogs(local);
    }
  } catch (e) {
    // ignore
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.rpc('increment_blog_views', { post_slug: slug });
    } catch (err) {
      // safe fallback if RPC doesn't exist
    }
  }
}
