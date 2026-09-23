import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts";

// ─────────────────────────────────────────────
// MARKET SNAPSHOT · Aug 5, 2026
// Prices anchored to real quotes where verified (RKLB, SPCX, SPY, QQQ, IWM, GLD, XLK, XLC);
// remaining prices are calibrated estimates. IV / HV / IV Rank remain SIMULATED teaching
// values until wired to a live options data feed.
// ─────────────────────────────────────────────
const UNIVERSE = [
  { t: "A", n: "Agilent Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "AAL", n: "American Airlines", etf: false, p: 14.8, chg: -0.8, earn: "2026-10-23" },
  { t: "AAPL", n: "Apple", etf: false, p: 246.8, chg: 0.6, earn: "2026-10-29" },
  { t: "ABBV", n: "AbbVie", etf: false, p: null, chg: null, earn: "?" },
  { t: "ABNB", n: "Airbnb", etf: false, p: null, chg: null, earn: "?" },
  { t: "ABT", n: "Abbott Laboratories", etf: false, p: null, chg: null, earn: "?" },
  { t: "ACGL", n: "Arch Capital Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "ACN", n: "Accenture", etf: false, p: null, chg: null, earn: "?" },
  { t: "ADBE", n: "Adobe Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "ADI", n: "Analog Devices", etf: false, p: null, chg: null, earn: "?" },
  { t: "ADM", n: "Archer Daniels Midland", etf: false, p: null, chg: null, earn: "?" },
  { t: "ADP", n: "Automatic Data Processing", etf: false, p: null, chg: null, earn: "?" },
  { t: "ADSK", n: "Autodesk", etf: false, p: null, chg: null, earn: "?" },
  { t: "AEE", n: "Ameren", etf: false, p: null, chg: null, earn: "?" },
  { t: "AEP", n: "American Electric Power", etf: false, p: null, chg: null, earn: "?" },
  { t: "AES", n: "AES Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "AFL", n: "Aflac", etf: false, p: null, chg: null, earn: "?" },
  { t: "AIG", n: "American International Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "AIZ", n: "Assurant", etf: false, p: null, chg: null, earn: "?" },
  { t: "AJG", n: "Arthur J. Gallagher & Co.", etf: false, p: null, chg: null, earn: "?" },
  { t: "AKAM", n: "Akamai Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "ALB", n: "Albemarle Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "ALGN", n: "Align Technology", etf: false, p: null, chg: null, earn: "?" },
  { t: "ALL", n: "Allstate", etf: false, p: null, chg: null, earn: "?" },
  { t: "ALLE", n: "Allegion", etf: false, p: null, chg: null, earn: "?" },
  { t: "AMAT", n: "Applied Materials", etf: false, p: null, chg: null, earn: "?" },
  { t: "AMCR", n: "Amcor", etf: false, p: null, chg: null, earn: "?" },
  { t: "AMD", n: "Advanced Micro Devices", etf: false, p: 218.6, chg: 4.2, earn: "2026-11-03" },
  { t: "AME", n: "Ametek", etf: false, p: null, chg: null, earn: "?" },
  { t: "AMGN", n: "Amgen", etf: false, p: null, chg: null, earn: "?" },
  { t: "AMP", n: "Ameriprise Financial", etf: false, p: null, chg: null, earn: "?" },
  { t: "AMT", n: "American Tower", etf: false, p: null, chg: null, earn: "?" },
  { t: "AMZN", n: "Amazon", etf: false, p: 267.3, chg: 1.4, earn: "2026-10-29" },
  { t: "ANET", n: "Arista Networks", etf: false, p: null, chg: null, earn: "?" },
  { t: "AON", n: "Aon plc", etf: false, p: null, chg: null, earn: "?" },
  { t: "AOS", n: "A. O. Smith", etf: false, p: null, chg: null, earn: "?" },
  { t: "APA", n: "APA Corporation", etf: false, p: 24.6, chg: -3.1, earn: "2026-11-04" },
  { t: "APD", n: "Air Products", etf: false, p: null, chg: null, earn: "?" },
  { t: "APH", n: "Amphenol", etf: false, p: null, chg: null, earn: "?" },
  { t: "APO", n: "Apollo Global Management", etf: false, p: null, chg: null, earn: "?" },
  { t: "APP", n: "AppLovin", etf: false, p: null, chg: null, earn: "?" },
  { t: "APTV", n: "Aptiv", etf: false, p: null, chg: null, earn: "?" },
  { t: "ARE", n: "Alexandria Real Estate Equities", etf: false, p: null, chg: null, earn: "?" },
  { t: "ARES", n: "Ares Management", etf: false, p: null, chg: null, earn: "?" },
  { t: "ARKK", n: "ARK Innovation ETF", etf: true, p: 84.6, chg: 2.4, earn: null },
  { t: "ARM", n: "Arm Holdings", etf: false, p: 172.4, chg: 1.8, earn: "2026-11-04" },
  { t: "ASTS", n: "AST SpaceMobile", etf: false, p: 58.4, chg: 3.2, earn: "2026-11-10" },
  { t: "ATO", n: "Atmos Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "AVGO", n: "Broadcom", etf: false, p: 342.1, chg: 3.1, earn: "2026-12-10" },
  { t: "AVY", n: "Avery Dennison", etf: false, p: null, chg: null, earn: "?" },
  { t: "AWK", n: "American Water Works", etf: false, p: null, chg: null, earn: "?" },
  { t: "AXON", n: "Axon Enterprise", etf: false, p: null, chg: null, earn: "?" },
  { t: "AXP", n: "American Express", etf: false, p: null, chg: null, earn: "?" },
  { t: "AZO", n: "AutoZone", etf: false, p: null, chg: null, earn: "?" },
  { t: "BA", n: "Boeing", etf: false, p: 228.6, chg: 1.2, earn: "2026-10-28" },
  { t: "BAC", n: "Bank of America", etf: false, p: 54.2, chg: 0.4, earn: "2026-10-14" },
  { t: "BALL", n: "Ball Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "BAX", n: "Baxter International", etf: false, p: null, chg: null, earn: "?" },
  { t: "BBY", n: "Best Buy", etf: false, p: null, chg: null, earn: "?" },
  { t: "BDX", n: "Becton Dickinson", etf: false, p: null, chg: null, earn: "?" },
  { t: "BE", n: "Bloom Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "BEN", n: "Franklin Resources", etf: false, p: null, chg: null, earn: "?" },
  { t: "BF.B", n: "Brown–Forman", etf: false, p: null, chg: null, earn: "?" },
  { t: "BG", n: "Bunge Global", etf: false, p: null, chg: null, earn: "?" },
  { t: "BIIB", n: "Biogen", etf: false, p: null, chg: null, earn: "?" },
  { t: "BKNG", n: "Booking Holdings", etf: false, p: null, chg: null, earn: "?" },
  { t: "BKR", n: "Baker Hughes", etf: false, p: 48.2, chg: -1.4, earn: "2026-10-21" },
  { t: "BLK", n: "BlackRock", etf: false, p: null, chg: null, earn: "?" },
  { t: "BMY", n: "Bristol Myers Squibb", etf: false, p: null, chg: null, earn: "?" },
  { t: "BNO", n: "Brent Oil Fund", etf: true, p: 32.4, chg: -3.6, earn: null },
  { t: "BNY", n: "BNY Mellon", etf: false, p: null, chg: null, earn: "?" },
  { t: "BR", n: "Broadridge Financial Solutions", etf: false, p: null, chg: null, earn: "?" },
  { t: "BRK.B", n: "Berkshire Hathaway", etf: false, p: null, chg: null, earn: "?" },
  { t: "BRO", n: "Brown & Brown", etf: false, p: null, chg: null, earn: "?" },
  { t: "BSX", n: "Boston Scientific", etf: false, p: null, chg: null, earn: "?" },
  { t: "BX", n: "Blackstone Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "BXP", n: "BXP, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "C", n: "Citigroup", etf: false, p: null, chg: null, earn: "?" },
  { t: "CAH", n: "Cardinal Health", etf: false, p: null, chg: null, earn: "?" },
  { t: "CARR", n: "Carrier Global", etf: false, p: null, chg: null, earn: "?" },
  { t: "CASY", n: "Casey's", etf: false, p: null, chg: null, earn: "?" },
  { t: "CAT", n: "Caterpillar Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "CB", n: "Chubb Limited", etf: false, p: null, chg: null, earn: "?" },
  { t: "CBOE", n: "Cboe Global Markets", etf: false, p: null, chg: null, earn: "?" },
  { t: "CBRE", n: "CBRE Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "CCI", n: "Crown Castle", etf: false, p: null, chg: null, earn: "?" },
  { t: "CCL", n: "Carnival", etf: false, p: 30.2, chg: 2, earn: "2026-09-29" },
  { t: "CDNS", n: "Cadence Design Systems", etf: false, p: null, chg: null, earn: "?" },
  { t: "CDW", n: "CDW Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "CEG", n: "Constellation Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "CF", n: "CF Industries", etf: false, p: null, chg: null, earn: "?" },
  { t: "CFG", n: "Citizens Financial Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "CHD", n: "Church & Dwight", etf: false, p: null, chg: null, earn: "?" },
  { t: "CHRW", n: "C.H. Robinson", etf: false, p: null, chg: null, earn: "?" },
  { t: "CHTR", n: "Charter Communications", etf: false, p: null, chg: null, earn: "?" },
  { t: "CI", n: "Cigna", etf: false, p: null, chg: null, earn: "?" },
  { t: "CIEN", n: "Ciena", etf: false, p: null, chg: null, earn: "?" },
  { t: "CINF", n: "Cincinnati Financial", etf: false, p: null, chg: null, earn: "?" },
  { t: "CL", n: "Colgate-Palmolive", etf: false, p: null, chg: null, earn: "?" },
  { t: "CLX", n: "Clorox", etf: false, p: null, chg: null, earn: "?" },
  { t: "CMCSA", n: "Comcast", etf: false, p: null, chg: null, earn: "?" },
  { t: "CME", n: "CME Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "CMG", n: "Chipotle Mexican Grill", etf: false, p: null, chg: null, earn: "?" },
  { t: "CMI", n: "Cummins", etf: false, p: null, chg: null, earn: "?" },
  { t: "CMS", n: "CMS Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "CNC", n: "Centene Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "CNP", n: "CenterPoint Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "COF", n: "Capital One", etf: false, p: null, chg: null, earn: "?" },
  { t: "COHR", n: "Coherent Corp.", etf: false, p: null, chg: null, earn: "?" },
  { t: "COIN", n: "Coinbase", etf: false, p: 312.5, chg: -4.1, earn: "2026-10-29" },
  { t: "COO", n: "Cooper Companies (The)", etf: false, p: null, chg: null, earn: "?" },
  { t: "COP", n: "ConocoPhillips", etf: false, p: 108.4, chg: -1.9, earn: "2026-11-05" },
  { t: "COR", n: "Cencora", etf: false, p: null, chg: null, earn: "?" },
  { t: "COST", n: "Costco", etf: false, p: null, chg: null, earn: "?" },
  { t: "CPAY", n: "Corpay", etf: false, p: null, chg: null, earn: "?" },
  { t: "CPRT", n: "Copart", etf: false, p: null, chg: null, earn: "?" },
  { t: "CPT", n: "Camden Property Trust", etf: false, p: null, chg: null, earn: "?" },
  { t: "CRH", n: "CRH plc", etf: false, p: null, chg: null, earn: "?" },
  { t: "CRL", n: "Charles River Laboratories", etf: false, p: null, chg: null, earn: "?" },
  { t: "CRM", n: "Salesforce", etf: false, p: null, chg: null, earn: "?" },
  { t: "CRWD", n: "CrowdStrike", etf: false, p: null, chg: null, earn: "?" },
  { t: "CRWV", n: "CoreWeave", etf: false, p: 118.2, chg: 3.6, earn: "2026-11-10" },
  { t: "CSCO", n: "Cisco", etf: false, p: null, chg: null, earn: "?" },
  { t: "CSGP", n: "CoStar Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "CSX", n: "CSX Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "CTAS", n: "Cintas", etf: false, p: null, chg: null, earn: "?" },
  { t: "CTRA", n: "Coterra Energy", etf: false, p: 26.4, chg: -1.5, earn: "2026-11-02" },
  { t: "CTSH", n: "Cognizant", etf: false, p: null, chg: null, earn: "?" },
  { t: "CTVA", n: "Corteva", etf: false, p: null, chg: null, earn: "?" },
  { t: "CVNA", n: "Carvana", etf: false, p: null, chg: null, earn: "?" },
  { t: "CVS", n: "CVS Health", etf: false, p: null, chg: null, earn: "?" },
  { t: "CVX", n: "Chevron", etf: false, p: 158.4, chg: -1.6, earn: "2026-10-30" },
  { t: "D", n: "Dominion Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "DAL", n: "Delta Air Lines", etf: false, p: null, chg: null, earn: "?" },
  { t: "DASH", n: "DoorDash", etf: false, p: null, chg: null, earn: "?" },
  { t: "DD", n: "DuPont", etf: false, p: null, chg: null, earn: "?" },
  { t: "DDOG", n: "Datadog", etf: false, p: null, chg: null, earn: "?" },
  { t: "DE", n: "Deere & Company", etf: false, p: null, chg: null, earn: "?" },
  { t: "DECK", n: "Deckers Brands", etf: false, p: null, chg: null, earn: "?" },
  { t: "DELL", n: "Dell Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "DG", n: "Dollar General", etf: false, p: null, chg: null, earn: "?" },
  { t: "DGX", n: "Quest Diagnostics", etf: false, p: null, chg: null, earn: "?" },
  { t: "DHI", n: "D. R. Horton", etf: false, p: null, chg: null, earn: "?" },
  { t: "DHR", n: "Danaher Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "DINO", n: "HF Sinclair", etf: false, p: 54.2, chg: -2.1, earn: "2026-11-05" },
  { t: "DIS", n: "Disney", etf: false, p: 116.2, chg: 0.7, earn: "2026-11-11" },
  { t: "DKNG", n: "DraftKings", etf: false, p: 46.8, chg: 1, earn: "2026-11-05" },
  { t: "DLR", n: "Digital Realty", etf: false, p: null, chg: null, earn: "?" },
  { t: "DLTR", n: "Dollar Tree", etf: false, p: null, chg: null, earn: "?" },
  { t: "DOC", n: "Healthpeak Properties", etf: false, p: null, chg: null, earn: "?" },
  { t: "DOV", n: "Dover Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "DOW", n: "Dow Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "DPZ", n: "Domino's", etf: false, p: null, chg: null, earn: "?" },
  { t: "DRI", n: "Darden Restaurants", etf: false, p: null, chg: null, earn: "?" },
  { t: "DTE", n: "DTE Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "DUK", n: "Duke Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "DVA", n: "DaVita", etf: false, p: null, chg: null, earn: "?" },
  { t: "DVN", n: "Devon Energy", etf: false, p: 36.8, chg: -2.4, earn: "2026-11-03" },
  { t: "DXCM", n: "Dexcom", etf: false, p: null, chg: null, earn: "?" },
  { t: "EBAY", n: "eBay Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "ECHO", n: "EchoStar", etf: false, p: null, chg: null, earn: "?" },
  { t: "ECL", n: "Ecolab", etf: false, p: null, chg: null, earn: "?" },
  { t: "ED", n: "Consolidated Edison", etf: false, p: null, chg: null, earn: "?" },
  { t: "EFX", n: "Equifax", etf: false, p: null, chg: null, earn: "?" },
  { t: "EG", n: "Everest Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "EIX", n: "Edison International", etf: false, p: null, chg: null, earn: "?" },
  { t: "EL", n: "Estée Lauder Companies (The)", etf: false, p: null, chg: null, earn: "?" },
  { t: "ELV", n: "Elevance Health", etf: false, p: null, chg: null, earn: "?" },
  { t: "EME", n: "Emcor", etf: false, p: null, chg: null, earn: "?" },
  { t: "EMR", n: "Emerson Electric", etf: false, p: null, chg: null, earn: "?" },
  { t: "EOG", n: "EOG Resources", etf: false, p: 132.6, chg: -1.7, earn: "2026-11-05" },
  { t: "EQIX", n: "Equinix", etf: false, p: null, chg: null, earn: "?" },
  { t: "EQT", n: "EQT Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "ERIE", n: "Erie Indemnity", etf: false, p: null, chg: null, earn: "?" },
  { t: "ES", n: "Eversource Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "ESS", n: "Essex Property Trust", etf: false, p: null, chg: null, earn: "?" },
  { t: "ETN", n: "Eaton Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "ETR", n: "Entergy", etf: false, p: null, chg: null, earn: "?" },
  { t: "EVRG", n: "Evergy", etf: false, p: null, chg: null, earn: "?" },
  { t: "EW", n: "Edwards Lifesciences", etf: false, p: null, chg: null, earn: "?" },
  { t: "EXC", n: "Exelon", etf: false, p: null, chg: null, earn: "?" },
  { t: "EXE", n: "Expand Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "EXPD", n: "Expeditors International", etf: false, p: null, chg: null, earn: "?" },
  { t: "EXPE", n: "Expedia Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "EXR", n: "Extra Space Storage", etf: false, p: null, chg: null, earn: "?" },
  { t: "F", n: "Ford Motor", etf: false, p: 12.6, chg: 0.3, earn: "2026-10-27" },
  { t: "FANG", n: "Diamondback Energy", etf: false, p: 154.2, chg: -2.2, earn: "2026-11-03" },
  { t: "FAST", n: "Fastenal", etf: false, p: null, chg: null, earn: "?" },
  { t: "FCX", n: "Freeport-McMoRan", etf: false, p: null, chg: null, earn: "?" },
  { t: "FDS", n: "FactSet", etf: false, p: null, chg: null, earn: "?" },
  { t: "FDX", n: "FedEx", etf: false, p: null, chg: null, earn: "?" },
  { t: "FDXF", n: "FedEx Freight", etf: false, p: null, chg: null, earn: "?" },
  { t: "FE", n: "FirstEnergy", etf: false, p: null, chg: null, earn: "?" },
  { t: "FERG", n: "Ferguson Enterprises", etf: false, p: null, chg: null, earn: "?" },
  { t: "FFIV", n: "F5, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "FICO", n: "Fair Isaac", etf: false, p: null, chg: null, earn: "?" },
  { t: "FIS", n: "Fidelity National Information Services", etf: false, p: null, chg: null, earn: "?" },
  { t: "FISV", n: "Fiserv", etf: false, p: null, chg: null, earn: "?" },
  { t: "FITB", n: "Fifth Third Bancorp", etf: false, p: null, chg: null, earn: "?" },
  { t: "FIX", n: "Comfort Systems USA", etf: false, p: null, chg: null, earn: "?" },
  { t: "FLEX", n: "Flex Ltd.", etf: false, p: null, chg: null, earn: "?" },
  { t: "FOX", n: "Fox Corporation (Class B)", etf: false, p: null, chg: null, earn: "?" },
  { t: "FOXA", n: "Fox Corporation (Class A)", etf: false, p: null, chg: null, earn: "?" },
  { t: "FRT", n: "Federal Realty Investment Trust", etf: false, p: null, chg: null, earn: "?" },
  { t: "FSLR", n: "First Solar", etf: false, p: null, chg: null, earn: "?" },
  { t: "FTNT", n: "Fortinet", etf: false, p: null, chg: null, earn: "?" },
  { t: "FTV", n: "Fortive", etf: false, p: null, chg: null, earn: "?" },
  { t: "GD", n: "General Dynamics", etf: false, p: null, chg: null, earn: "?" },
  { t: "GDDY", n: "GoDaddy", etf: false, p: null, chg: null, earn: "?" },
  { t: "GE", n: "GE Aerospace", etf: false, p: null, chg: null, earn: "?" },
  { t: "GEHC", n: "GE HealthCare", etf: false, p: null, chg: null, earn: "?" },
  { t: "GEN", n: "Gen Digital", etf: false, p: null, chg: null, earn: "?" },
  { t: "GEV", n: "GE Vernova", etf: false, p: null, chg: null, earn: "?" },
  { t: "GILD", n: "Gilead Sciences", etf: false, p: null, chg: null, earn: "?" },
  { t: "GIS", n: "General Mills", etf: false, p: null, chg: null, earn: "?" },
  { t: "GL", n: "Globe Life", etf: false, p: null, chg: null, earn: "?" },
  { t: "GLD", n: "Gold ETF", etf: true, p: 374.2, chg: 0.7, earn: null },
  { t: "GLW", n: "Corning Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "GM", n: "General Motors", etf: false, p: null, chg: null, earn: "?" },
  { t: "GME", n: "GameStop", etf: false, p: 24.8, chg: 5.7, earn: "2026-12-08" },
  { t: "GNRC", n: "Generac", etf: false, p: null, chg: null, earn: "?" },
  { t: "GOOG", n: "Alphabet Inc. (Class C)", etf: false, p: null, chg: null, earn: "?" },
  { t: "GOOGL", n: "Alphabet", etf: false, p: 241.6, chg: 0.9, earn: "2026-10-27" },
  { t: "GPC", n: "Genuine Parts Company", etf: false, p: null, chg: null, earn: "?" },
  { t: "GPN", n: "Global Payments", etf: false, p: null, chg: null, earn: "?" },
  { t: "GRMN", n: "Garmin", etf: false, p: null, chg: null, earn: "?" },
  { t: "GS", n: "Goldman Sachs", etf: false, p: null, chg: null, earn: "?" },
  { t: "GWW", n: "W. W. Grainger", etf: false, p: null, chg: null, earn: "?" },
  { t: "HAL", n: "Halliburton", etf: false, p: 28.4, chg: -2.7, earn: "2026-10-20" },
  { t: "HAS", n: "Hasbro", etf: false, p: null, chg: null, earn: "?" },
  { t: "HBAN", n: "Huntington Bancshares", etf: false, p: null, chg: null, earn: "?" },
  { t: "HCA", n: "HCA Healthcare", etf: false, p: null, chg: null, earn: "?" },
  { t: "HD", n: "Home Depot (The)", etf: false, p: null, chg: null, earn: "?" },
  { t: "HIG", n: "Hartford (The)", etf: false, p: null, chg: null, earn: "?" },
  { t: "HII", n: "Huntington Ingalls Industries", etf: false, p: null, chg: null, earn: "?" },
  { t: "HIMS", n: "Hims & Hers", etf: false, p: 52.3, chg: -1.4, earn: "2026-11-02" },
  { t: "HLT", n: "Hilton Worldwide", etf: false, p: null, chg: null, earn: "?" },
  { t: "HON", n: "Honeywell Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "HONA", n: "Honeywell Aerospace", etf: false, p: null, chg: null, earn: "?" },
  { t: "HOOD", n: "Robinhood", etf: false, p: 112.6, chg: 4.8, earn: "2026-11-04" },
  { t: "HPE", n: "Hewlett Packard Enterprise", etf: false, p: null, chg: null, earn: "?" },
  { t: "HPQ", n: "HP Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "HRL", n: "Hormel Foods", etf: false, p: null, chg: null, earn: "?" },
  { t: "HSIC", n: "Henry Schein", etf: false, p: null, chg: null, earn: "?" },
  { t: "HST", n: "Host Hotels & Resorts", etf: false, p: null, chg: null, earn: "?" },
  { t: "HSY", n: "Hershey Company (The)", etf: false, p: null, chg: null, earn: "?" },
  { t: "HUBB", n: "Hubbell Incorporated", etf: false, p: null, chg: null, earn: "?" },
  { t: "HUM", n: "Humana", etf: false, p: null, chg: null, earn: "?" },
  { t: "HWM", n: "Howmet Aerospace", etf: false, p: null, chg: null, earn: "?" },
  { t: "IBKR", n: "Interactive Brokers", etf: false, p: null, chg: null, earn: "?" },
  { t: "IBM", n: "IBM", etf: false, p: null, chg: null, earn: "?" },
  { t: "ICE", n: "Intercontinental Exchange", etf: false, p: null, chg: null, earn: "?" },
  { t: "IDXX", n: "Idexx Laboratories", etf: false, p: null, chg: null, earn: "?" },
  { t: "IEX", n: "IDEX Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "IFF", n: "International Flavors & Fragrances", etf: false, p: null, chg: null, earn: "?" },
  { t: "ILMN", n: "Illumina, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "INCY", n: "Incyte", etf: false, p: null, chg: null, earn: "?" },
  { t: "INTC", n: "Intel", etf: false, p: 27.4, chg: -0.7, earn: "2026-10-22" },
  { t: "INTU", n: "Intuit", etf: false, p: null, chg: null, earn: "?" },
  { t: "INVH", n: "Invitation Homes", etf: false, p: null, chg: null, earn: "?" },
  { t: "IONQ", n: "IonQ", etf: false, p: 44.6, chg: -3.4, earn: "2026-11-04" },
  { t: "IP", n: "International Paper", etf: false, p: null, chg: null, earn: "?" },
  { t: "IQV", n: "IQVIA", etf: false, p: null, chg: null, earn: "?" },
  { t: "IR", n: "Ingersoll Rand", etf: false, p: null, chg: null, earn: "?" },
  { t: "IRM", n: "Iron Mountain", etf: false, p: null, chg: null, earn: "?" },
  { t: "ISRG", n: "Intuitive Surgical", etf: false, p: null, chg: null, earn: "?" },
  { t: "IT", n: "Gartner", etf: false, p: null, chg: null, earn: "?" },
  { t: "ITW", n: "Illinois Tool Works", etf: false, p: null, chg: null, earn: "?" },
  { t: "IVZ", n: "Invesco", etf: false, p: null, chg: null, earn: "?" },
  { t: "IWM", n: "Russell 2000 ETF", etf: true, p: 301.7, chg: 0.9, earn: null },
  { t: "J", n: "Jacobs Solutions", etf: false, p: null, chg: null, earn: "?" },
  { t: "JBHT", n: "J.B. Hunt", etf: false, p: null, chg: null, earn: "?" },
  { t: "JBL", n: "Jabil", etf: false, p: null, chg: null, earn: "?" },
  { t: "JCI", n: "Johnson Controls", etf: false, p: null, chg: null, earn: "?" },
  { t: "JKHY", n: "Jack Henry & Associates", etf: false, p: null, chg: null, earn: "?" },
  { t: "JNJ", n: "Johnson & Johnson", etf: false, p: null, chg: null, earn: "?" },
  { t: "JPM", n: "JPMorgan Chase", etf: false, p: 328.6, chg: 0.5, earn: "2026-10-13" },
  { t: "KDP", n: "Keurig Dr Pepper", etf: false, p: null, chg: null, earn: "?" },
  { t: "KEY", n: "KeyCorp", etf: false, p: null, chg: null, earn: "?" },
  { t: "KEYS", n: "Keysight Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "KHC", n: "Kraft Heinz", etf: false, p: null, chg: null, earn: "?" },
  { t: "KIM", n: "Kimco Realty", etf: false, p: null, chg: null, earn: "?" },
  { t: "KKR", n: "KKR & Co.", etf: false, p: null, chg: null, earn: "?" },
  { t: "KLAC", n: "KLA Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "KMB", n: "Kimberly-Clark", etf: false, p: null, chg: null, earn: "?" },
  { t: "KMI", n: "Kinder Morgan", etf: false, p: 30.8, chg: -0.7, earn: "2026-10-21" },
  { t: "KO", n: "Coca-Cola", etf: false, p: 74.2, chg: -0.3, earn: "2026-10-21" },
  { t: "KR", n: "Kroger", etf: false, p: null, chg: null, earn: "?" },
  { t: "KVUE", n: "Kenvue", etf: false, p: null, chg: null, earn: "?" },
  { t: "L", n: "Loews Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "LDOS", n: "Leidos", etf: false, p: null, chg: null, earn: "?" },
  { t: "LEN", n: "Lennar", etf: false, p: null, chg: null, earn: "?" },
  { t: "LH", n: "Labcorp", etf: false, p: null, chg: null, earn: "?" },
  { t: "LHX", n: "L3Harris", etf: false, p: null, chg: null, earn: "?" },
  { t: "LII", n: "Lennox International", etf: false, p: null, chg: null, earn: "?" },
  { t: "LIN", n: "Linde plc", etf: false, p: null, chg: null, earn: "?" },
  { t: "LITE", n: "Lumentum", etf: false, p: null, chg: null, earn: "?" },
  { t: "LLY", n: "Lilly (Eli)", etf: false, p: null, chg: null, earn: "?" },
  { t: "LMT", n: "Lockheed Martin", etf: false, p: null, chg: null, earn: "?" },
  { t: "LNG", n: "Cheniere Energy", etf: false, p: 246.8, chg: -0.8, earn: "2026-10-30" },
  { t: "LNT", n: "Alliant Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "LOW", n: "Lowe's", etf: false, p: null, chg: null, earn: "?" },
  { t: "LRCX", n: "Lam Research", etf: false, p: null, chg: null, earn: "?" },
  { t: "LULU", n: "Lululemon Athletica", etf: false, p: null, chg: null, earn: "?" },
  { t: "LUNR", n: "Intuitive Machines", etf: false, p: 14.2, chg: -1.8, earn: "2026-11-12" },
  { t: "LUV", n: "Southwest Airlines", etf: false, p: null, chg: null, earn: "?" },
  { t: "LVS", n: "Las Vegas Sands", etf: false, p: null, chg: null, earn: "?" },
  { t: "LYB", n: "LyondellBasell", etf: false, p: null, chg: null, earn: "?" },
  { t: "LYV", n: "Live Nation Entertainment", etf: false, p: null, chg: null, earn: "?" },
  { t: "MA", n: "Mastercard", etf: false, p: null, chg: null, earn: "?" },
  { t: "MAA", n: "Mid-America Apartment Communities", etf: false, p: null, chg: null, earn: "?" },
  { t: "MAR", n: "Marriott International", etf: false, p: null, chg: null, earn: "?" },
  { t: "MARA", n: "MARA Holdings", etf: false, p: 17.4, chg: -2.9, earn: "2026-10-29" },
  { t: "MAS", n: "Masco", etf: false, p: null, chg: null, earn: "?" },
  { t: "MCD", n: "McDonald's", etf: false, p: 318.4, chg: 0.1, earn: "2026-10-27" },
  { t: "MCHP", n: "Microchip Technology", etf: false, p: null, chg: null, earn: "?" },
  { t: "MCK", n: "McKesson Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "MCO", n: "Moody's Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "MDLZ", n: "Mondelez International", etf: false, p: null, chg: null, earn: "?" },
  { t: "MDT", n: "Medtronic", etf: false, p: null, chg: null, earn: "?" },
  { t: "MET", n: "MetLife", etf: false, p: null, chg: null, earn: "?" },
  { t: "META", n: "Meta Platforms", etf: false, p: 828.4, chg: 1.7, earn: "2026-10-28" },
  { t: "MGM", n: "MGM Resorts", etf: false, p: null, chg: null, earn: "?" },
  { t: "MKC", n: "McCormick & Company", etf: false, p: null, chg: null, earn: "?" },
  { t: "MLM", n: "Martin Marietta Materials", etf: false, p: null, chg: null, earn: "?" },
  { t: "MMM", n: "3M", etf: false, p: null, chg: null, earn: "?" },
  { t: "MNST", n: "Monster Beverage", etf: false, p: null, chg: null, earn: "?" },
  { t: "MO", n: "Altria", etf: false, p: null, chg: null, earn: "?" },
  { t: "MOS", n: "Mosaic Company (The)", etf: false, p: null, chg: null, earn: "?" },
  { t: "MPC", n: "Marathon Petroleum", etf: false, p: 198.6, chg: -1.6, earn: "2026-11-03" },
  { t: "MPWR", n: "Monolithic Power Systems", etf: false, p: null, chg: null, earn: "?" },
  { t: "MRK", n: "Merck & Co.", etf: false, p: null, chg: null, earn: "?" },
  { t: "MRNA", n: "Moderna", etf: false, p: null, chg: null, earn: "?" },
  { t: "MRSH", n: "Marsh McLennan", etf: false, p: null, chg: null, earn: "?" },
  { t: "MRVL", n: "Marvell Technology", etf: false, p: null, chg: null, earn: "?" },
  { t: "MS", n: "Morgan Stanley", etf: false, p: null, chg: null, earn: "?" },
  { t: "MSCI", n: "MSCI", etf: false, p: null, chg: null, earn: "?" },
  { t: "MSFT", n: "Microsoft", etf: false, p: 562, chg: 1.1, earn: "2026-10-28" },
  { t: "MSI", n: "Motorola Solutions", etf: false, p: null, chg: null, earn: "?" },
  { t: "MTB", n: "M&T Bank", etf: false, p: null, chg: null, earn: "?" },
  { t: "MTD", n: "Mettler Toledo", etf: false, p: null, chg: null, earn: "?" },
  { t: "MU", n: "Micron", etf: false, p: 168.9, chg: 2.6, earn: "2026-09-24" },
  { t: "NCLH", n: "Norwegian Cruise Line Holdings", etf: false, p: null, chg: null, earn: "?" },
  { t: "NDAQ", n: "Nasdaq, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "NDSN", n: "Nordson Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "NEE", n: "NextEra Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "NEM", n: "Newmont", etf: false, p: null, chg: null, earn: "?" },
  { t: "NFLX", n: "Netflix", etf: false, p: 1342, chg: -0.4, earn: "2026-10-20" },
  { t: "NI", n: "NiSource", etf: false, p: null, chg: null, earn: "?" },
  { t: "NKE", n: "Nike", etf: false, p: 84.2, chg: -1.2, earn: "2026-09-24" },
  { t: "NOC", n: "Northrop Grumman", etf: false, p: null, chg: null, earn: "?" },
  { t: "NOW", n: "ServiceNow", etf: false, p: null, chg: null, earn: "?" },
  { t: "NRG", n: "NRG Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "NSC", n: "Norfolk Southern", etf: false, p: null, chg: null, earn: "?" },
  { t: "NTAP", n: "NetApp", etf: false, p: null, chg: null, earn: "?" },
  { t: "NTRS", n: "Northern Trust", etf: false, p: null, chg: null, earn: "?" },
  { t: "NUE", n: "Nucor", etf: false, p: null, chg: null, earn: "?" },
  { t: "NVDA", n: "NVIDIA", etf: false, p: 209.5, chg: 2.8, earn: "2026-11-18" },
  { t: "NVR", n: "NVR, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "NWS", n: "News Corp (Class B)", etf: false, p: null, chg: null, earn: "?" },
  { t: "NWSA", n: "News Corp (Class A)", etf: false, p: null, chg: null, earn: "?" },
  { t: "NXPI", n: "NXP Semiconductors", etf: false, p: null, chg: null, earn: "?" },
  { t: "O", n: "Realty Income", etf: false, p: null, chg: null, earn: "?" },
  { t: "ODFL", n: "Old Dominion", etf: false, p: null, chg: null, earn: "?" },
  { t: "OIH", n: "Oil Services ETF", etf: true, p: 286.4, chg: -2.8, earn: null },
  { t: "OKE", n: "ONEOK", etf: false, p: 86.2, chg: -0.9, earn: "2026-10-27" },
  { t: "OMC", n: "Omnicom Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "ON", n: "ON Semiconductor", etf: false, p: null, chg: null, earn: "?" },
  { t: "ORCL", n: "Oracle Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "ORLY", n: "O'Reilly Automotive", etf: false, p: null, chg: null, earn: "?" },
  { t: "OTIS", n: "Otis Worldwide", etf: false, p: null, chg: null, earn: "?" },
  { t: "OXY", n: "Occidental Petroleum", etf: false, p: 46.8, chg: -2.6, earn: "2026-11-10" },
  { t: "P", n: "Everpure", etf: false, p: null, chg: null, earn: "?" },
  { t: "PANW", n: "Palo Alto Networks", etf: false, p: null, chg: null, earn: "?" },
  { t: "PAYX", n: "Paychex", etf: false, p: null, chg: null, earn: "?" },
  { t: "PBF", n: "PBF Energy", etf: false, p: 32.6, chg: -2.8, earn: "2026-10-29" },
  { t: "PCAR", n: "Paccar", etf: false, p: null, chg: null, earn: "?" },
  { t: "PCG", n: "PG&E Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "PEG", n: "Public Service Enterprise Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "PEP", n: "PepsiCo", etf: false, p: null, chg: null, earn: "?" },
  { t: "PFE", n: "Pfizer", etf: false, p: 28.6, chg: -0.2, earn: "2026-11-03" },
  { t: "PFG", n: "Principal Financial Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "PG", n: "Procter & Gamble", etf: false, p: null, chg: null, earn: "?" },
  { t: "PGR", n: "Progressive Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "PH", n: "Parker Hannifin", etf: false, p: null, chg: null, earn: "?" },
  { t: "PHM", n: "PulteGroup", etf: false, p: null, chg: null, earn: "?" },
  { t: "PKG", n: "Packaging Corporation of America", etf: false, p: null, chg: null, earn: "?" },
  { t: "PLD", n: "Prologis", etf: false, p: null, chg: null, earn: "?" },
  { t: "PLTR", n: "Palantir", etf: false, p: 168.3, chg: -1.9, earn: "2026-11-02" },
  { t: "PM", n: "Philip Morris International", etf: false, p: null, chg: null, earn: "?" },
  { t: "PNC", n: "PNC Financial Services", etf: false, p: null, chg: null, earn: "?" },
  { t: "PNR", n: "Pentair", etf: false, p: null, chg: null, earn: "?" },
  { t: "PNW", n: "Pinnacle West Capital", etf: false, p: null, chg: null, earn: "?" },
  { t: "PODD", n: "Insulet Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "PPG", n: "PPG Industries", etf: false, p: null, chg: null, earn: "?" },
  { t: "PPL", n: "PPL Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "PR", n: "Permian Resources", etf: false, p: 14.9, chg: -2.9, earn: "2026-11-04" },
  { t: "PRU", n: "Prudential Financial", etf: false, p: null, chg: null, earn: "?" },
  { t: "PSA", n: "Public Storage", etf: false, p: null, chg: null, earn: "?" },
  { t: "PSKY", n: "Paramount Skydance Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "PSX", n: "Phillips 66", etf: false, p: 142.8, chg: -1.4, earn: "2026-10-30" },
  { t: "PTC", n: "PTC Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "PWR", n: "Quanta Services", etf: false, p: null, chg: null, earn: "?" },
  { t: "PYPL", n: "PayPal", etf: false, p: 76.4, chg: 1.5, earn: "2026-10-28" },
  { t: "Q", n: "Qnity Electronics", etf: false, p: null, chg: null, earn: "?" },
  { t: "QCOM", n: "Qualcomm", etf: false, p: null, chg: null, earn: "?" },
  { t: "QQQ", n: "Nasdaq 100 ETF", etf: true, p: 723.9, chg: 1.2, earn: null },
  { t: "RCL", n: "Royal Caribbean Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "RDDT", n: "Reddit", etf: false, p: 188.6, chg: 2.2, earn: "2026-10-28" },
  { t: "REG", n: "Regency Centers", etf: false, p: null, chg: null, earn: "?" },
  { t: "REGN", n: "Regeneron Pharmaceuticals", etf: false, p: null, chg: null, earn: "?" },
  { t: "RF", n: "Regions Financial Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "RIVN", n: "Rivian", etf: false, p: 14.8, chg: 1.6, earn: "2026-11-04" },
  { t: "RJF", n: "Raymond James Financial", etf: false, p: null, chg: null, earn: "?" },
  { t: "RKLB", n: "Rocket Lab", etf: false, p: 74.75, chg: 6.1, earn: "2026-11-10" },
  { t: "RL", n: "Ralph Lauren Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "RMD", n: "ResMed|", etf: false, p: null, chg: null, earn: "?" },
  { t: "ROK", n: "Rockwell Automation", etf: false, p: null, chg: null, earn: "?" },
  { t: "ROKU", n: "Roku", etf: false, p: 82.6, chg: -1.1, earn: "2026-10-29" },
  { t: "ROL", n: "Rollins, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "ROP", n: "Roper Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "ROST", n: "Ross Stores", etf: false, p: null, chg: null, earn: "?" },
  { t: "RSG", n: "Republic Services", etf: false, p: null, chg: null, earn: "?" },
  { t: "RTX", n: "RTX Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "RVTY", n: "Revvity", etf: false, p: null, chg: null, earn: "?" },
  { t: "SBAC", n: "SBA Communications", etf: false, p: null, chg: null, earn: "?" },
  { t: "SBUX", n: "Starbucks", etf: false, p: null, chg: null, earn: "?" },
  { t: "SCHW", n: "Charles Schwab Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "SHOP", n: "Shopify", etf: false, p: 132.4, chg: 2.1, earn: "2026-11-05" },
  { t: "SHW", n: "Sherwin-Williams", etf: false, p: null, chg: null, earn: "?" },
  { t: "SJM", n: "J.M. Smucker Company (The)", etf: false, p: null, chg: null, earn: "?" },
  { t: "SLB", n: "SLB (Schlumberger)", etf: false, p: 42.6, chg: -2.3, earn: "2026-10-16" },
  { t: "SLV", n: "Silver ETF", etf: true, p: 41.2, chg: 1.6, earn: null },
  { t: "SMCI", n: "Super Micro", etf: false, p: 62.7, chg: -2.1, earn: "2026-11-03" },
  { t: "SMH", n: "Semiconductor ETF", etf: true, p: 388.5, chg: 3.4, earn: null },
  { t: "SNA", n: "Snap-on", etf: false, p: null, chg: null, earn: "?" },
  { t: "SNAP", n: "Snap", etf: false, p: 8.9, chg: -0.8, earn: "2026-10-28" },
  { t: "SNDK", n: "Sandisk", etf: false, p: null, chg: null, earn: "?" },
  { t: "SNPS", n: "Synopsys", etf: false, p: null, chg: null, earn: "?" },
  { t: "SO", n: "Southern Company", etf: false, p: null, chg: null, earn: "?" },
  { t: "SOFI", n: "SoFi Technologies", etf: false, p: 24.6, chg: 2.3, earn: "2026-10-27" },
  { t: "SOLV", n: "Solventum", etf: false, p: null, chg: null, earn: "?" },
  { t: "SPCX", n: "SpaceX", etf: false, p: 125.33, chg: 9.4, earn: "2026-12-02" },
  { t: "SPG", n: "Simon Property Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "SPGI", n: "S&P Global", etf: false, p: null, chg: null, earn: "?" },
  { t: "SPY", n: "S&P 500 ETF", etf: true, p: 771.5, chg: 0.6, earn: null },
  { t: "SRE", n: "Sempra", etf: false, p: null, chg: null, earn: "?" },
  { t: "STE", n: "Steris", etf: false, p: null, chg: null, earn: "?" },
  { t: "STLD", n: "Steel Dynamics", etf: false, p: null, chg: null, earn: "?" },
  { t: "STT", n: "State Street Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "STX", n: "Seagate Technology", etf: false, p: null, chg: null, earn: "?" },
  { t: "STZ", n: "Constellation Brands", etf: false, p: null, chg: null, earn: "?" },
  { t: "SW", n: "Smurfit Westrock", etf: false, p: null, chg: null, earn: "?" },
  { t: "SWK", n: "Stanley Black & Decker", etf: false, p: null, chg: null, earn: "?" },
  { t: "SWKS", n: "Skyworks Solutions", etf: false, p: null, chg: null, earn: "?" },
  { t: "SYF", n: "Synchrony Financial", etf: false, p: null, chg: null, earn: "?" },
  { t: "SYK", n: "Stryker Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "SYY", n: "Sysco", etf: false, p: null, chg: null, earn: "?" },
  { t: "T", n: "AT&T", etf: false, p: null, chg: null, earn: "?" },
  { t: "TDG", n: "TransDigm Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "TDY", n: "Teledyne Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "TECH", n: "Bio-Techne", etf: false, p: null, chg: null, earn: "?" },
  { t: "TEL", n: "TE Connectivity", etf: false, p: null, chg: null, earn: "?" },
  { t: "TER", n: "Teradyne", etf: false, p: null, chg: null, earn: "?" },
  { t: "TFC", n: "Truist Financial", etf: false, p: null, chg: null, earn: "?" },
  { t: "TGT", n: "Target Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "TJX", n: "TJX Companies", etf: false, p: null, chg: null, earn: "?" },
  { t: "TKO", n: "TKO Group Holdings", etf: false, p: null, chg: null, earn: "?" },
  { t: "TLT", n: "20+ Yr Treasury ETF", etf: true, p: 96.4, chg: 0.3, earn: null },
  { t: "TMO", n: "Thermo Fisher Scientific", etf: false, p: null, chg: null, earn: "?" },
  { t: "TMUS", n: "T-Mobile US", etf: false, p: null, chg: null, earn: "?" },
  { t: "TPL", n: "Texas Pacific Land Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "TPR", n: "Tapestry, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "TRGP", n: "Targa Resources", etf: false, p: 178.6, chg: -1.2, earn: "2026-11-05" },
  { t: "TRMB", n: "Trimble Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "TROW", n: "T. Rowe Price", etf: false, p: null, chg: null, earn: "?" },
  { t: "TRV", n: "Travelers Companies (The)", etf: false, p: null, chg: null, earn: "?" },
  { t: "TSCO", n: "Tractor Supply", etf: false, p: null, chg: null, earn: "?" },
  { t: "TSLA", n: "Tesla", etf: false, p: 302.8, chg: -2.6, earn: "2026-10-21" },
  { t: "TSN", n: "Tyson Foods", etf: false, p: null, chg: null, earn: "?" },
  { t: "TT", n: "Trane Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "TTWO", n: "Take-Two Interactive", etf: false, p: null, chg: null, earn: "?" },
  { t: "TXN", n: "Texas Instruments", etf: false, p: null, chg: null, earn: "?" },
  { t: "TXT", n: "Textron", etf: false, p: null, chg: null, earn: "?" },
  { t: "TYL", n: "Tyler Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "UAL", n: "United Airlines Holdings", etf: false, p: null, chg: null, earn: "?" },
  { t: "UBER", n: "Uber", etf: false, p: 98.2, chg: 0.8, earn: "2026-11-04" },
  { t: "UDR", n: "UDR, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "UHS", n: "Universal Health Services", etf: false, p: null, chg: null, earn: "?" },
  { t: "ULTA", n: "Ulta Beauty", etf: false, p: null, chg: null, earn: "?" },
  { t: "UNG", n: "Natural Gas Fund", etf: true, p: 18.6, chg: 2.4, earn: null },
  { t: "UNH", n: "UnitedHealth Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "UNP", n: "Union Pacific Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "UPS", n: "United Parcel Service", etf: false, p: null, chg: null, earn: "?" },
  { t: "URI", n: "United Rentals", etf: false, p: null, chg: null, earn: "?" },
  { t: "USB", n: "U.S. Bancorp", etf: false, p: null, chg: null, earn: "?" },
  { t: "USO", n: "US Oil Fund", etf: true, p: 68.4, chg: -3.8, earn: null },
  { t: "V", n: "Visa Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "VEEV", n: "Veeva Systems", etf: false, p: null, chg: null, earn: "?" },
  { t: "VICI", n: "Vici Properties", etf: false, p: null, chg: null, earn: "?" },
  { t: "VLO", n: "Valero Energy", etf: false, p: 168.4, chg: -1.8, earn: "2026-10-22" },
  { t: "VLTO", n: "Veralto", etf: false, p: null, chg: null, earn: "?" },
  { t: "VMC", n: "Vulcan Materials Company", etf: false, p: null, chg: null, earn: "?" },
  { t: "VMRK", n: "Vivmark Residential", etf: false, p: null, chg: null, earn: "?" },
  { t: "VRSK", n: "Verisk Analytics", etf: false, p: null, chg: null, earn: "?" },
  { t: "VRSN", n: "Verisign", etf: false, p: null, chg: null, earn: "?" },
  { t: "VRT", n: "Vertiv", etf: false, p: null, chg: null, earn: "?" },
  { t: "VRTX", n: "Vertex Pharmaceuticals", etf: false, p: null, chg: null, earn: "?" },
  { t: "VST", n: "Vistra Corp.", etf: false, p: null, chg: null, earn: "?" },
  { t: "VTR", n: "Ventas", etf: false, p: null, chg: null, earn: "?" },
  { t: "VTRS", n: "Viatris", etf: false, p: null, chg: null, earn: "?" },
  { t: "VXX", n: "VIX Short-Term ETN", etf: true, p: 38.2, chg: -2.4, earn: null },
  { t: "VZ", n: "Verizon", etf: false, p: null, chg: null, earn: "?" },
  { t: "WAB", n: "Wabtec", etf: false, p: null, chg: null, earn: "?" },
  { t: "WAT", n: "Waters Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "WBD", n: "Warner Bros. Discovery", etf: false, p: null, chg: null, earn: "?" },
  { t: "WDAY", n: "Workday, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "WDC", n: "Western Digital", etf: false, p: null, chg: null, earn: "?" },
  { t: "WEC", n: "WEC Energy Group", etf: false, p: null, chg: null, earn: "?" },
  { t: "WELL", n: "Welltower", etf: false, p: null, chg: null, earn: "?" },
  { t: "WFC", n: "Wells Fargo", etf: false, p: null, chg: null, earn: "?" },
  { t: "WM", n: "Waste Management", etf: false, p: null, chg: null, earn: "?" },
  { t: "WMB", n: "Williams Companies", etf: false, p: 62.4, chg: -0.6, earn: "2026-11-02" },
  { t: "WMT", n: "Walmart", etf: false, p: 118.6, chg: 0.2, earn: "2026-11-17" },
  { t: "WRB", n: "W. R. Berkley Corporation", etf: false, p: null, chg: null, earn: "?" },
  { t: "WSM", n: "Williams-Sonoma, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "WST", n: "West Pharmaceutical Services", etf: false, p: null, chg: null, earn: "?" },
  { t: "WTW", n: "Willis Towers Watson", etf: false, p: null, chg: null, earn: "?" },
  { t: "WY", n: "Weyerhaeuser", etf: false, p: null, chg: null, earn: "?" },
  { t: "WYNN", n: "Wynn Resorts", etf: false, p: null, chg: null, earn: "?" },
  { t: "XEL", n: "Xcel Energy", etf: false, p: null, chg: null, earn: "?" },
  { t: "XLE", n: "Energy Sector ETF", etf: true, p: 94.6, chg: -1.8, earn: null },
  { t: "XLF", n: "Financials ETF", etf: true, p: 58.2, chg: 0.3, earn: null },
  { t: "XLK", n: "Technology ETF", etf: true, p: 182, chg: 2.2, earn: null },
  { t: "XOM", n: "Exxon Mobil", etf: false, p: 112.8, chg: -1.9, earn: "2026-10-30" },
  { t: "XOP", n: "Oil & Gas Explor. ETF", etf: true, p: 148.6, chg: -2.5, earn: null },
  { t: "XYL", n: "Xylem Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "XYZ", n: "Block, Inc.", etf: false, p: null, chg: null, earn: "?" },
  { t: "YUM", n: "Yum! Brands", etf: false, p: null, chg: null, earn: "?" },
  { t: "ZBH", n: "Zimmer Biomet", etf: false, p: null, chg: null, earn: "?" },
  { t: "ZBRA", n: "Zebra Technologies", etf: false, p: null, chg: null, earn: "?" },
  { t: "ZTS", n: "Zoetis", etf: false, p: null, chg: null, earn: "?" },
];

// ─────────────────────────────────────────────
// SECTOR ROTATION · relative performance vs SPY (%)
// Regime snapshot: growth/tech leading, oil sliding on Hormuz-deal news, defensives lagging.
// ─────────────────────────────────────────────
const SECTORS = [
  { s: "XLK", n: "Technology", w1: 1.9, m1: 3.4 },
  { s: "XLI", n: "Industrials", w1: 1.2, m1: 1.0 },
  { s: "XLC", n: "Comm Services", w1: 0.8, m1: 0.8 },
  { s: "XLY", n: "Discretionary", w1: 0.5, m1: 1.2 },
  { s: "XLF", n: "Financials", w1: 0.1, m1: 1.6 },
  { s: "XLB", n: "Materials", w1: -0.2, m1: -0.3 },
  { s: "XLRE", n: "Real Estate", w1: -0.5, m1: -0.8 },
  { s: "XLV", n: "Healthcare", w1: -0.9, m1: -1.6 },
  { s: "XLU", n: "Utilities", w1: -1.1, m1: -1.0 },
  { s: "XLP", n: "Staples", w1: -1.4, m1: -2.1 },
  { s: "XLE", n: "Energy", w1: -2.3, m1: -2.6 },
];

// Ticker → sector ETF mapping (GICS-style). Broad/commodity ETFs are unmapped (null).
const TICKER_SECTOR = {
  A: "XLV", AAPL: "XLK", ABBV: "XLV", ABNB: "XLY", ABT: "XLV", ACGL: "XLF",
  ACN: "XLK", ADBE: "XLK", ADI: "XLK", ADM: "XLP", ADP: "XLI", ADSK: "XLK",
  AEE: "XLU", AEP: "XLU", AES: "XLU", AFL: "XLF", AIG: "XLF", AIZ: "XLF",
  AJG: "XLF", AKAM: "XLK", ALB: "XLB", ALGN: "XLV", ALL: "XLF", ALLE: "XLI",
  AMAT: "XLK", AMCR: "XLB", AMD: "XLK", AME: "XLI", AMGN: "XLV", AMP: "XLF",
  AMT: "XLRE", AMZN: "XLY", ANET: "XLK", AON: "XLF", AOS: "XLI", APA: "XLE",
  APD: "XLB", APH: "XLK", APO: "XLF", APP: "XLC", APTV: "XLY", ARE: "XLRE",
  ARES: "XLF", ATO: "XLU", AVGO: "XLK", AVY: "XLB", AWK: "XLU", AXON: "XLI",
  AXP: "XLF", AZO: "XLY", BA: "XLI", BAC: "XLF", BALL: "XLB", BAX: "XLV",
  BBY: "XLY", BDX: "XLV", BE: "XLI", BEN: "XLF", "BF.B": "XLP", BG: "XLP",
  BIIB: "XLV", BKNG: "XLY", BKR: "XLE", BLK: "XLF", BMY: "XLV", BNY: "XLF",
  BR: "XLI", "BRK.B": "XLF", BRO: "XLF", BSX: "XLV", BX: "XLF", BXP: "XLRE",
  C: "XLF", CAH: "XLV", CARR: "XLI", CASY: "XLP", CAT: "XLI", CB: "XLF",
  CBOE: "XLF", CBRE: "XLRE", CCI: "XLRE", CCL: "XLY", CDNS: "XLK", CDW: "XLK",
  CEG: "XLU", CF: "XLB", CFG: "XLF", CHD: "XLP", CHRW: "XLI", CHTR: "XLC",
  CI: "XLV", CIEN: "XLK", CINF: "XLF", CL: "XLP", CLX: "XLP", CMCSA: "XLC",
  CME: "XLF", CMG: "XLY", CMI: "XLI", CMS: "XLU", CNC: "XLV", CNP: "XLU",
  COF: "XLF", COHR: "XLK", COIN: "XLF", COO: "XLV", COP: "XLE", COR: "XLV",
  COST: "XLP", CPAY: "XLF", CPRT: "XLI", CPT: "XLRE", CRH: "XLB", CRL: "XLV",
  CRM: "XLK", CRWD: "XLK", CSCO: "XLK", CSGP: "XLRE", CSX: "XLI", CTAS: "XLI",
  CTSH: "XLK", CTVA: "XLB", CVNA: "XLY", CVS: "XLV", CVX: "XLE", D: "XLU",
  DAL: "XLI", DASH: "XLY", DD: "XLI", DDOG: "XLK", DE: "XLI", DECK: "XLY",
  DELL: "XLK", DG: "XLP", DGX: "XLV", DHI: "XLY", DHR: "XLV", DIS: "XLC",
  DLR: "XLRE", DLTR: "XLP", DOC: "XLRE", DOV: "XLI", DOW: "XLB", DPZ: "XLY",
  DRI: "XLY", DTE: "XLU", DUK: "XLU", DVA: "XLV", DVN: "XLE", DXCM: "XLV",
  EBAY: "XLY", ECHO: "XLC", ECL: "XLB", ED: "XLU", EFX: "XLI", EG: "XLF",
  EIX: "XLU", EL: "XLP", ELV: "XLV", EME: "XLI", EMR: "XLI", EOG: "XLE",
  EQIX: "XLRE", EQT: "XLE", ERIE: "XLF", ES: "XLU", ESS: "XLRE", ETN: "XLI",
  ETR: "XLU", EVRG: "XLU", EW: "XLV", EXC: "XLU", EXE: "XLE", EXPD: "XLI",
  EXPE: "XLY", EXR: "XLRE", F: "XLY", FANG: "XLE", FAST: "XLI", FCX: "XLB",
  FDS: "XLF", FDX: "XLI", FDXF: "XLI", FE: "XLU", FERG: "XLI", FFIV: "XLK",
  FICO: "XLK", FIS: "XLF", FISV: "XLF", FITB: "XLF", FIX: "XLI", FLEX: "XLK",
  FOX: "XLC", FOXA: "XLC", FRT: "XLRE", FSLR: "XLK", FTNT: "XLK", FTV: "XLI",
  GD: "XLI", GDDY: "XLK", GE: "XLI", GEHC: "XLV", GEN: "XLK", GEV: "XLI",
  GILD: "XLV", GIS: "XLP", GL: "XLF", GLW: "XLK", GM: "XLY", GNRC: "XLI",
  GOOG: "XLC", GOOGL: "XLC", GPC: "XLY", GPN: "XLF", GRMN: "XLY", GS: "XLF",
  GWW: "XLI", HAL: "XLE", HAS: "XLY", HBAN: "XLF", HCA: "XLV", HD: "XLY",
  HIG: "XLF", HII: "XLI", HLT: "XLY", HON: "XLI", HONA: "XLI", HOOD: "XLF",
  HPE: "XLK", HPQ: "XLK", HRL: "XLP", HSIC: "XLV", HST: "XLRE", HSY: "XLP",
  HUBB: "XLI", HUM: "XLV", HWM: "XLI", IBKR: "XLF", IBM: "XLK", ICE: "XLF",
  IDXX: "XLV", IEX: "XLI", IFF: "XLB", ILMN: "XLV", INCY: "XLV", INTC: "XLK",
  INTU: "XLK", INVH: "XLRE", IP: "XLB", IQV: "XLV", IR: "XLI", IRM: "XLRE",
  ISRG: "XLV", IT: "XLK", ITW: "XLI", IVZ: "XLF", J: "XLI", JBHT: "XLI",
  JBL: "XLK", JCI: "XLI", JKHY: "XLF", JNJ: "XLV", JPM: "XLF", KDP: "XLP",
  KEY: "XLF", KEYS: "XLK", KHC: "XLP", KIM: "XLRE", KKR: "XLF", KLAC: "XLK",
  KMB: "XLP", KMI: "XLE", KO: "XLP", KR: "XLP", KVUE: "XLP", L: "XLF",
  LDOS: "XLI", LEN: "XLY", LH: "XLV", LHX: "XLI", LII: "XLI", LIN: "XLB",
  LITE: "XLK", LLY: "XLV", LMT: "XLI", LNT: "XLU", LOW: "XLY", LRCX: "XLK",
  LULU: "XLY", LUV: "XLI", LVS: "XLY", LYB: "XLB", LYV: "XLC", MA: "XLF",
  MAA: "XLRE", MAR: "XLY", MAS: "XLI", MCD: "XLY", MCHP: "XLK", MCK: "XLV",
  MCO: "XLF", MDLZ: "XLP", MDT: "XLV", MET: "XLF", META: "XLC", MGM: "XLY",
  MKC: "XLP", MLM: "XLB", MMM: "XLI", MNST: "XLP", MO: "XLP", MOS: "XLB",
  MPC: "XLE", MPWR: "XLK", MRK: "XLV", MRNA: "XLV", MRSH: "XLF", MRVL: "XLK",
  MS: "XLF", MSCI: "XLF", MSFT: "XLK", MSI: "XLK", MTB: "XLF", MTD: "XLV",
  MU: "XLK", NCLH: "XLY", NDAQ: "XLF", NDSN: "XLI", NEE: "XLU", NEM: "XLB",
  NFLX: "XLC", NI: "XLU", NKE: "XLY", NOC: "XLI", NOW: "XLK", NRG: "XLU",
  NSC: "XLI", NTAP: "XLK", NTRS: "XLF", NUE: "XLB", NVDA: "XLK", NVR: "XLY",
  NWS: "XLC", NWSA: "XLC", NXPI: "XLK", O: "XLRE", ODFL: "XLI", OKE: "XLE",
  OMC: "XLC", ON: "XLK", ORCL: "XLK", ORLY: "XLY", OTIS: "XLI", OXY: "XLE",
  P: "XLK", PANW: "XLK", PAYX: "XLI", PCAR: "XLI", PCG: "XLU", PEG: "XLU",
  PEP: "XLP", PFE: "XLV", PFG: "XLF", PG: "XLP", PGR: "XLF", PH: "XLI",
  PHM: "XLY", PKG: "XLB", PLD: "XLRE", PLTR: "XLK", PM: "XLP", PNC: "XLF",
  PNR: "XLI", PNW: "XLU", PODD: "XLV", PPG: "XLB", PPL: "XLU", PRU: "XLF",
  PSA: "XLRE", PSKY: "XLC", PSX: "XLE", PTC: "XLK", PWR: "XLI", PYPL: "XLF",
  Q: "XLK", QCOM: "XLK", RCL: "XLY", RDDT: "XLC", REG: "XLRE", REGN: "XLV",
  RF: "XLF", RJF: "XLF", RL: "XLY", RMD: "XLV", ROK: "XLI", ROL: "XLI",
  ROP: "XLK", ROST: "XLY", RSG: "XLI", RTX: "XLI", RVTY: "XLV", SBAC: "XLRE",
  SBUX: "XLY", SCHW: "XLF", SHW: "XLB", SJM: "XLP", SLB: "XLE", SMCI: "XLK",
  SNA: "XLI", SNDK: "XLK", SNPS: "XLK", SO: "XLU", SOLV: "XLV", SPG: "XLRE",
  SPGI: "XLF", SRE: "XLU", STE: "XLV", STLD: "XLB", STT: "XLF", STX: "XLK",
  STZ: "XLP", SW: "XLB", SWK: "XLI", SWKS: "XLK", SYF: "XLF", SYK: "XLV",
  SYY: "XLP", T: "XLC", TDG: "XLI", TDY: "XLK", TECH: "XLV", TEL: "XLK",
  TER: "XLK", TFC: "XLF", TGT: "XLP", TJX: "XLY", TKO: "XLC", TMO: "XLV",
  TMUS: "XLC", TPL: "XLE", TPR: "XLY", TRGP: "XLE", TRMB: "XLK", TROW: "XLF",
  TRV: "XLF", TSCO: "XLY", TSLA: "XLY", TSN: "XLP", TT: "XLI", TTWO: "XLC",
  TXN: "XLK", TXT: "XLI", TYL: "XLK", UAL: "XLI", UBER: "XLI", UDR: "XLRE",
  UHS: "XLV", ULTA: "XLY", UNH: "XLV", UNP: "XLI", UPS: "XLI", URI: "XLI",
  USB: "XLF", V: "XLF", VEEV: "XLV", VICI: "XLRE", VLO: "XLE", VLTO: "XLI",
  VMC: "XLB", VMRK: "XLRE", VRSK: "XLI", VRSN: "XLK", VRT: "XLI", VRTX: "XLV",
  VST: "XLU", VTR: "XLRE", VTRS: "XLV", VZ: "XLC", WAB: "XLI", WAT: "XLV",
  WBD: "XLC", WDAY: "XLK", WDC: "XLK", WEC: "XLU", WELL: "XLRE", WFC: "XLF",
  WM: "XLI", WMB: "XLE", WMT: "XLP", WRB: "XLF", WSM: "XLY", WST: "XLV",
  WTW: "XLF", WY: "XLRE", WYNN: "XLY", XEL: "XLU", XOM: "XLE", XYL: "XLI",
  XYZ: "XLF", YUM: "XLY", ZBH: "XLV", ZBRA: "XLK", ZTS: "XLV",
};
const SECTOR_NAME = Object.fromEntries(SECTORS.map((x) => [x.s, x.n]));
const SECTOR_W1 = Object.fromEntries(SECTORS.map((x) => [x.s, x.w1]));

// ─────────────────────────────────────────────
// OPTIONS LIQUIDITY TIERS (simulated — live version will score from real
// option volume, open interest, and bid-ask spread width)
// 3 = ELITE: penny-wide spreads, massive volume/OI — trade freely
// 2 = GOOD: tradeable, use limit orders, mind the spread
// 1 = THIN: wide spreads, hard fills — small accounts should avoid
// ─────────────────────────────────────────────
const TICKER_LIQ = {
  SPY: 3, QQQ: 3, IWM: 3, TLT: 3, GLD: 3, SLV: 3, XLE: 3, XLF: 3, XLK: 3, SMH: 3,
  NVDA: 3, TSLA: 3, AAPL: 3, AMD: 3, META: 3, AMZN: 3, MSFT: 3, GOOGL: 3,
  PLTR: 3, COIN: 3, HOOD: 3, SOFI: 3, F: 3, INTC: 3, RIVN: 3, MARA: 3, GME: 3,
  SNAP: 3, BAC: 3, RKLB: 3, SPCX: 3, ARKK: 2, USO: 2, VXX: 2,
  AVGO: 2, MU: 2, NFLX: 2, SHOP: 2, UBER: 2, DKNG: 2, ARM: 2, SMCI: 2, CRWV: 2,
  IONQ: 2, RDDT: 2, HIMS: 2, ASTS: 2, XOM: 2, CVX: 2, JPM: 2, WMT: 2, KO: 2,
  MCD: 2, DIS: 2, BA: 2, NKE: 2, PYPL: 2, PFE: 2, CCL: 2, AAL: 2, ROKU: 2,
  LUNR: 1,
  // Energy: majors & big E&P names carry deep option markets; small refiners are thinner
  OXY: 3, SLB: 3, COP: 3, DVN: 3, HAL: 3, EOG: 3, KMI: 3, FANG: 3, XOP: 3,
  VLO: 2, MPC: 2, OKE: 2, PSX: 2, WMB: 2, LNG: 2, BKR: 2, APA: 2, CTRA: 2,
  TRGP: 2, PR: 2, PBF: 2, OIH: 2, UNG: 2, BNO: 2,
  DINO: 1,
};
// null = not yet scored. The curated tiers below are hand-checked; every other name in
// the universe stays unscored until vol.mjs grades it from real volume/OI/spread data.
// Inventing a tier for 400+ tickers would be the same mistake as inventing their IV.
const liq = (t) => TICKER_LIQ[t] ?? null;
const liqSort = (t) => TICKER_LIQ[t] ?? 0; // unscored sinks below scored on tiebreaks
const LIQ_LABEL = { 3: "ELITE", 2: "GOOD", 1: "THIN", 0: "UNSCORED" };
const LIQ_DOTS = { 3: "●●●", 2: "●●○", 1: "●○○", 0: "○○○" };
const LIQ_COLOR = { 3: "#1E7A46", 2: "#8A8578", 1: "#B03E1E", 0: "#C4BFB2" };

// ─────────────────────────────────────────────
// LOGIC
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// DATE ENGINE — everything time-based is computed live against today, so
// day-counts can never stall the way the old hardcoded `ed` values did.
// ─────────────────────────────────────────────
const dayMs = 86400000;
const todayISO = () => new Date().toISOString().slice(0, 10);
const parseISO = (d) => new Date(`${d}T00:00:00Z`);
// "?" marks a ticker whose earnings date we don't hold — distinct from null (ETF, genuinely none).
const UNKNOWN_ER = "?";
const isRealDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
const daysUntil = (d) => (isRealDate(d) ? Math.round((parseISO(d) - parseISO(todayISO())) / dayMs) : null);
const fmtDate = (d) => {
  if (!isRealDate(d)) return null;
  const x = parseISO(d);
  return `${x.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase()} ${String(x.getUTCDate()).padStart(2, "0")}`;
};

const EARNINGS_SOON_DAYS = 14;
// A date in the past means the calendar entry needs refreshing — surfaced, never silently trusted.
const earningsStale = (s) => isRealDate(s.earn) && daysUntil(s.earn) < 0;
const earningsUnknown = (s) => s.earn === UNKNOWN_ER;
const earningsSoon = (s) => {
  const d = daysUntil(s.earn);
  return d !== null && d >= 0 && d <= EARNINGS_SOON_DAYS;
};

// ─────────────────────────────────────────────
// MACRO EVENT CALENDAR
// Dates published a year ahead. FOMC per the Federal Reserve calendar (decision
// lands on day 2 of each meeting); CPI/PPI/payrolls/JOLTS per the BLS release
// schedule. sev 3 = reprices the whole tape, 2 = meaningful, 1 = background.
// These are what make an expiration dirty for index and rate-sensitive names.
// ─────────────────────────────────────────────
const MACRO_EVENTS = [
  { d: "2026-10-02", k: "NFP", n: "Payrolls (Sep)", sev: 3 },
  { d: "2026-10-14", k: "CPI", n: "CPI (Sep)", sev: 3 },
  { d: "2026-10-16", k: "PPI", n: "PPI (Sep)", sev: 2 },
  { d: "2026-10-28", k: "FOMC", n: "FOMC decision", sev: 3 },
  { d: "2026-11-03", k: "JOLTS", n: "JOLTS (Sep)", sev: 1 },
  { d: "2026-11-06", k: "NFP", n: "Payrolls (Oct)", sev: 3 },
  { d: "2026-11-10", k: "CPI", n: "CPI (Oct)", sev: 3 },
  { d: "2026-11-13", k: "PPI", n: "PPI (Oct)", sev: 2 },
  { d: "2026-12-04", k: "NFP", n: "Payrolls (Nov)", sev: 3 },
  { d: "2026-12-09", k: "FOMC", n: "FOMC decision + dot plot", sev: 3 },
  { d: "2026-12-10", k: "CPI", n: "CPI (Nov)", sev: 3 },
  { d: "2026-12-16", k: "PPI", n: "PPI (Nov)", sev: 2 },
  { d: "2027-01-08", k: "NFP", n: "Payrolls (Dec)", sev: 3 },
  { d: "2027-01-13", k: "CPI", n: "CPI (Dec)", sev: 3 },
  { d: "2027-01-27", k: "FOMC", n: "FOMC decision", sev: 3 },
];

// Macro events between now and a given expiration date.
const macroBefore = (expISO) => {
  const t = todayISO();
  return MACRO_EVENTS.filter((e) => e.d > t && e.d <= expISO);
};

// Score one expiration. Grading is RELATIVE, not absolute: macro events fire every
// couple of weeks, so any 30-45 DTE expiry inevitably spans two or three. The useful
// signal is whether earnings land inside it and how many heavy prints it carries
// versus the alternatives on the same ticker.
function gradeExpiry(expISO, dte, earnISO) {
  const macro = macroBefore(expISO);
  const unknownER = earnISO === UNKNOWN_ER;
  const hasEarn = isRealDate(earnISO) && earnISO > todayISO() && earnISO <= expISO;
  const heavy = macro.filter((e) => e.sev === 3).length;
  // Compact tags: unique event kinds, heavy ones first, earnings flagged up front.
  const kinds = [...new Set(macro.filter((e) => e.sev === 3).map((e) => e.k))];
  const tags = hasEarn ? ["ER", ...kinds] : unknownER ? ["ER?", ...kinds] : kinds;
  let grade;
  if (hasEarn) grade = "earnings";
  // An unconfirmed earnings date can never be graded clean — it would claim safety we
  // haven't verified. Capped at "unknown" until a real date is on file.
  else if (unknownER) grade = "unknown";
  else if (heavy === 0) grade = "clean";
  else if (heavy <= 2) grade = "light";
  else if (heavy <= 4) grade = "busy";
  else grade = "loaded";
  return { expISO, dte, tags, macro, hasEarn, unknownER, heavy, grade };
}

// Does this name have at least one sellable expiration free of heavy macro + earnings?
function hasCleanExpiry(s) {
  const rows = s.expirations && s.expirations.length
    ? s.expirations
    : [30, 45, 60].map((n) => ({ d: new Date(Date.now() + n * dayMs).toISOString().slice(0, 10), dte: n }));
  // Realistic bar: no earnings inside, and at most two heavy macro prints.
  // Requiring zero macro would return almost nothing at sellable DTE.
  // Unverified earnings dates are excluded — unknown is not the same as clear.
  return rows.some((e) => {
    if (e.dte < 20) return false;
    const g = gradeExpiry(e.d, e.dte, s.earn);
    return !g.hasEarn && !g.unknownER && g.heavy <= 2;
  });
}

const GRADE_STYLE = {
  clean: { label: "CLEAN", fg: "#1E7A46", bg: "#EDF7F0", bd: "#BFE0CB" },
  light: { label: "LIGHT", fg: "#4E7A3E", bg: "#F2F7ED", bd: "#D0E0C2" },
  busy: { label: "BUSY", fg: "#9A6B12", bg: "#FCF4E4", bd: "#EDD9AE" },
  unknown: { label: "ER UNVERIFIED", fg: "#7A6A55", bg: "#F5F2EC", bd: "#DFD8C9" },
  loaded: { label: "LOADED", fg: "#B03E1E", bg: "#FBEEE8", bd: "#F0CDBD" },
  earnings: { label: "EARNINGS", fg: "#B03E1E", bg: "#FBEEE8", bd: "#F0CDBD" },
};

function expectedMove(price, iv, days) {
  return price * (iv / 100) * Math.sqrt(days / 365);
}

function getStrategies(s) {
  const e = earningsSoon(s);
  // IV meaningfully BELOW realized vol: options are cheap relative to actual movement.
  // Selling premium here has no vol edge regardless of what IV rank says.
  if (s.iv != null && s.hv != null && s.iv - s.hv <= -5) {
    return [
      { name: "Long Straddle / Strangle", tag: "vol underpriced vs realized", setup: "ATM or ~30Δ · 45+ DTE" },
      { name: "Calendar Spread", tag: "long vega · IV expansion", setup: "ATM · sell 30 / buy 60 DTE" },
      { name: "Debit Spread (directional)", tag: "defined risk · cheap premium", setup: "buy ~60Δ sell ~40Δ · 45 DTE" },
    ];
  }
  if (s.ivr >= 70) {
    return [
      { name: "Short Strangle", tag: e ? "IV crush play" : "premium selling", setup: "~16Δ shorts · 30–45 DTE" },
      { name: "Short Straddle", tag: "max premium · neutral", setup: "ATM 50Δ · 30–45 DTE" },
      { name: "Iron Condor", tag: "defined risk · high POP", setup: "~16Δ shorts · 30–45 DTE" },
    ];
  }
  if (s.ivr >= 50) {
    return [
      { name: "Short Strangle", tag: "premium selling", setup: "~16Δ shorts · 30–45 DTE" },
      { name: "Cash-Secured Put", tag: "bullish · get paid to wait", setup: "~30Δ put · 30–45 DTE" },
      { name: "Put Credit Spread", tag: "defined risk · bullish", setup: "sell ~25Δ · 30–45 DTE" },
    ];
  }
  if (s.ivr >= 30) {
    return [
      { name: "Cash-Secured Put", tag: "bullish income", setup: "~30Δ put · 30–45 DTE" },
      { name: "Covered Call / PMCC", tag: "income on shares", setup: "sell ~30Δ call · 30–45 DTE" },
      { name: "Iron Condor (wide)", tag: "defined risk · neutral", setup: "~10–16Δ shorts · 45 DTE" },
    ];
  }
  return [
    { name: "Long Call / LEAPS", tag: "cheap premium · directional", setup: "70–80Δ · 90+ DTE" },
    { name: "Calendar Spread", tag: "long vega · IV expansion", setup: "ATM · sell 30 / buy 60 DTE" },
    { name: "Call Debit Spread", tag: "defined risk · low cost", setup: "buy ~60Δ sell ~40Δ · 45 DTE" },
  ];
}

function ivColor(ivr) {
  if (ivr >= 70) return "#D34A24";
  if (ivr >= 50) return "#C77E14";
  if (ivr >= 30) return "#6E7E96";
  return "#4C79AC";
}
function ivLabel(ivr) {
  if (ivr >= 70) return "HOT";
  if (ivr >= 50) return "ELEVATED";
  if (ivr >= 30) return "NORMAL";
  return "LOW";
}

const fmt = (x) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─────────────────────────────────────────────
// SECTOR ROTATION PANEL
// ─────────────────────────────────────────────
function SectorRotation({ active, onSelect }) {
  const [win, setWin] = useState("w1");
  const [open, setOpen] = useState(true);
  const data = [...SECTORS]
    .map((x) => ({ ...x, v: win === "w1" ? x.w1 : x.m1 }))
    .sort((a, b) => b.v - a.v);
  const inflows = data.filter((d) => d.v > 0).map((d) => d.n);
  const outflows = data.filter((d) => d.v < 0).slice(-3).map((d) => d.n);

  return (
    <div style={{ margin: "20px 24px 4px", background: "#FFFFFF", border: "1px solid #E7E4DC", borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.04em", color: "#22282F" }}>SECTOR ROTATION</div>
          <div style={{ fontSize: 11, color: "#8A8578", marginTop: 2 }}>
            Relative to SPY — bars right of zero = money rotating in · <span style={{ fontWeight: 700, color: "#DD8A17" }}>click a bar to filter the cards below</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[{ id: "w1", label: "1 WEEK" }, { id: "m1", label: "1 MONTH" }].map((o) => (
            <button
              key={o.id}
              onClick={() => setWin(o.id)}
              style={{
                cursor: "pointer", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", padding: "6px 10px",
                borderRadius: 6,
                background: win === o.id ? "#22282F" : "#FFFFFF",
                color: win === o.id ? "#FFFFFF" : "#8A8578",
                border: win === o.id ? "1px solid #22282F" : "1px solid #DDD9CF",
              }}
            >
              {o.label}
            </button>
          ))}
          <button
            onClick={() => setOpen(!open)}
            style={{ cursor: "pointer", fontSize: 10.5, fontWeight: 700, padding: "6px 10px", borderRadius: 6, background: "#FFFFFF", color: "#8A8578", border: "1px solid #DDD9CF" }}
          >
            {open ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div style={{ height: 330, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                style={{ cursor: "pointer" }}
                onClick={(state) => {
                  const p = state && state.activePayload && state.activePayload[0] && state.activePayload[0].payload;
                  if (p) onSelect(p.s === active ? null : p.s);
                }}
              >
                <XAxis type="number" domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#8A8578", fontFamily: "'IBM Plex Mono', monospace" }} tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="n" width={104} tick={{ fontSize: 11, fill: "#3A414C", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#F5F4F0" }}
                  formatter={(v, name, props) => [`${v > 0 ? "+" : ""}${v}% vs SPY`, props.payload.s]}
                  contentStyle={{ border: "1px solid #E7E4DC", borderRadius: 8, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}
                />
                <ReferenceLine x={0} stroke="#C9C4B8" />
                <Bar
                  dataKey="v"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                >
                  {data.map((d) => {
                    const base = d.v >= 0 ? "#1E8A4C" : "#D34A24";
                    const dim = d.v >= 0 ? "#BFDCCB" : "#EFC5B8";
                    return (
                      <Cell
                        key={d.s}
                        fill={active && d.s !== active ? dim : base}
                        stroke={d.s === active ? "#22282F" : "none"}
                        strokeWidth={d.s === active ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11.5, color: "#5B6472", borderTop: "1px solid #EFEDE7", paddingTop: 10, marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: "#1E8A4C" }}>Money in:</span> {inflows.join(", ")}
            <span style={{ margin: "0 10px", color: "#C9C4B8" }}>|</span>
            <span style={{ fontWeight: 700, color: "#D34A24" }}>Money out:</span> {outflows.join(", ")}
            <span style={{ display: "block", marginTop: 4, color: "#A6A192", fontSize: 10.5 }}>
              Growth-led tape: tech, industrials & comm services leading while oil-driven energy and defensives (staples, healthcare, utilities) bleed — classic risk-on rotation.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────
function IVMeter({ ivr }) {
  return (
    <div style={{ position: "relative", height: 8, borderRadius: 4, background: "#EBE8E1", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", inset: 0, width: `${ivr}%`,
          background: "linear-gradient(90deg, #4C79AC 0%, #8FA0B8 35%, #E0A32E 60%, #E05A2B 100%)",
          backgroundSize: `${100 / (ivr / 100)}% 100%`,
          borderRadius: 4, transition: "width .4s ease",
        }}
      />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1.5, background: "#C9C4B8" }} />
    </div>
  );
}

function RangeRow({ label, price, iv, days }) {
  const mv = expectedMove(price, iv, days);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderTop: "1px solid #EFEDE7" }}>
      <span style={{ fontSize: 11, letterSpacing: "0.08em", color: "#8A8578", fontFamily: "'IBM Plex Mono', monospace" }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#3A414C" }}>
        ±{fmt(mv)}
        <span style={{ color: "#A6A192", marginLeft: 8 }}>
          {fmt(price - mv)} – {fmt(price + mv)}
        </span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// MACRO STRIP — the scheduled events that make expirations dirty, always visible
// ─────────────────────────────────────────────
function MacroStrip() {
  const t = todayISO();
  const upcoming = MACRO_EVENTS.filter((e) => e.d >= t).slice(0, 7);
  if (!upcoming.length) return null;
  return (
    <div style={{ margin: "14px 24px 0", background: "#FFFFFF", border: "1px solid #E7E4DC", borderRadius: 14, padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "#22282F", whiteSpace: "nowrap" }}>
          MACRO AHEAD
        </span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
          {upcoming.map((e) => {
            const d = daysUntil(e.d);
            const hot = e.sev === 3 && d <= 14;
            return (
              <span
                key={e.d + e.k}
                title={`${e.n} — ${fmtDate(e.d)}, ${d} days out`}
                style={{
                  fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
                  borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap",
                  color: hot ? "#B03E1E" : e.sev === 3 ? "#5B5646" : "#8A8578",
                  background: hot ? "#FBEEE8" : "#FAFAF8",
                  border: `1px solid ${hot ? "#F0CDBD" : "#EFEDE7"}`,
                }}
              >
                {e.k} {fmtDate(e.d)} <span style={{ opacity: 0.65 }}>{d}d</span>
              </span>
            );
          })}
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: "#A6A192", marginTop: 7 }}>
        Fed and BLS dates, published a year ahead. Any expiration that spans one of these carries event risk the IV rank alone won't show.
      </div>
    </div>
  );
}

function StockCard({ s, watched, onStar, onSector, onVol, volLoading }) {
  const up = s.chg >= 0;
  const strats = getStrategies(s);
  const heat = ivColor(s.ivr);
  const erSoon = earningsSoon(s);
  const erStale = earningsStale(s);
  const erUnknown = earningsUnknown(s);
  const erDays = daysUntil(s.earn);
  // Map macro + earnings events onto each live expiration. Falls back to a synthetic
  // 30/45/60-day ladder until Tradier's real expirations arrive for this ticker.
  const expiryRows = (s.expirations && s.expirations.length
    ? s.expirations
    : [30, 45, 60].map((n) => ({ d: new Date(Date.now() + n * dayMs).toISOString().slice(0, 10), dte: n, synthetic: true }))
  ).map((e) => ({ ...gradeExpiry(e.d, e.dte, s.earn), synthetic: e.synthetic }));
  const bestExpiry = [...expiryRows]
    .filter((e) => e.dte >= 20)
    .sort((a, b) => (a.heavy - b.heavy) || (a.hasEarn === b.hasEarn ? 0 : a.hasEarn ? 1 : -1) || (a.tags.length - b.tags.length))[0];
  const tier = s.liveLiq ?? liq(s.t) ?? 0; // live Tradier score wins; 0 = not yet scored
  return (
    <div
      style={{
        background: "#FFFFFF", border: "1px solid #E7E4DC", borderRadius: 14, padding: 18,
        display: "flex", flexDirection: "column", gap: 12,
        boxShadow: s.ivr >= 70
          ? `0 0 0 1px ${heat}2E, 0 10px 26px -16px ${heat}55`
          : "0 8px 22px -18px rgba(60,55,40,.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "#8A8578", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.n}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.02em", color: "#22282F", fontFamily: "'IBM Plex Mono', monospace" }}>{s.t}</span>
            <span
              title={s.liveLiq
                ? "Options liquidity: scored LIVE from Tradier option volume, open interest & spread width"
                : tier === 0
                  ? "Options liquidity not yet scored — tap ↻ to grade it from live volume, open interest & spread width"
                  : `Options liquidity: ${LIQ_LABEL[tier]} (hand-checked) — tap ↻ to score from live Tradier data`}
              style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: LIQ_COLOR[tier], fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {LIQ_DOTS[tier]} {LIQ_LABEL[tier]}{s.liveLiq ? "*" : ""}
            </span>
            {s.etf && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6E86", border: "1px solid #D4DAE3", borderRadius: 4, padding: "2px 6px", background: "#F2F4F8" }}>ETF</span>
            )}
            {TICKER_SECTOR[s.t] && (
              <button
                onClick={() => onSector(TICKER_SECTOR[s.t])}
                title={`Filter to ${SECTOR_NAME[TICKER_SECTOR[s.t]]}`}
                style={{
                  cursor: "pointer", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", borderRadius: 4, padding: "2px 6px",
                  color: SECTOR_W1[TICKER_SECTOR[s.t]] >= 0 ? "#1E7A46" : "#B03E1E",
                  background: SECTOR_W1[TICKER_SECTOR[s.t]] >= 0 ? "#EDF7F0" : "#FBEEE8",
                  border: SECTOR_W1[TICKER_SECTOR[s.t]] >= 0 ? "1px solid #BFE0CB" : "1px solid #F0CDBD",
                }}
              >
                {SECTOR_NAME[TICKER_SECTOR[s.t]].toUpperCase()} {SECTOR_W1[TICKER_SECTOR[s.t]] >= 0 ? "▲" : "▼"}
              </button>
            )}
            {erSoon && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#FFFFFF", background: "#DD8A17", borderRadius: 4, padding: "2px 6px" }}>
                ER {fmtDate(s.earn)} · {erDays}D
              </span>
            )}
            {erStale && (
              <span title="This earnings date has passed — the calendar entry needs updating." style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#B03E1E", background: "#FBEEE8", border: "1px solid #F0CDBD", borderRadius: 4, padding: "2px 6px" }}>
                ER DATE STALE
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#22282F", fontFamily: "'IBM Plex Mono', monospace" }}>${fmt(s.p)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: up ? "#1E8A4C" : "#D34A24" }}>
              {up ? "▲" : "▼"} {up ? "+" : ""}{s.chg.toFixed(1)}%
            </div>
          </div>
          <button
            onClick={() => onStar(s.t)}
            aria-label={watched ? `Remove ${s.t} from watchlist` : `Add ${s.t} to watchlist`}
            style={{
              cursor: "pointer", background: "transparent", border: "none", padding: 2, lineHeight: 1,
              fontSize: 20, color: watched ? "#DD8A17" : "#CFCBC0",
              transition: "color .15s ease",
            }}
          >
            {watched ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8A8578", fontWeight: 700 }}>
            IV RANK
            {s.ivLive && !s.ivrReal && (
              <span title="IV is live; rank is estimated until ~20 days of IV history accumulate" style={{ marginLeft: 5, color: "#C77E14" }}>EST</span>
            )}
            {s.ivrReal && (
              <span title="Rank computed from your app's own accumulated IV history" style={{ marginLeft: 5, color: "#1E7A46" }}>REAL</span>
            )}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {s.ivTrend && (
              <span
                title={`IV ${s.ivTrend} — ${s.iv5d > 0 ? "+" : ""}${s.iv5d} vol points over the last ${s.ivRefDays} days. A rank that's climbing and one that's bleeding are opposite trades.`}
                style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.04em", borderRadius: 3, padding: "2px 5px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: s.ivTrend === "rising" ? "#B03E1E" : s.ivTrend === "falling" ? "#2E6DA4" : "#8A8578",
                  background: s.ivTrend === "rising" ? "#FBEEE8" : s.ivTrend === "falling" ? "#EDF2F8" : "#F5F4F0",
                  border: `1px solid ${s.ivTrend === "rising" ? "#F0CDBD" : s.ivTrend === "falling" ? "#C9DAEC" : "#E7E4DC"}`,
                }}
              >
                {s.ivTrend === "rising" ? "↗" : s.ivTrend === "falling" ? "↘" : "→"} {s.iv5d > 0 ? "+" : ""}{s.iv5d}
              </span>
            )}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: heat }}>
              {s.ivr} <span style={{ fontSize: 9, letterSpacing: "0.1em" }}>{ivLabel(s.ivr)}</span>
            </span>
            {onVol && (
              <button
                onClick={() => onVol(s.t)}
                title="Fetch live ATM IV, HV & liquidity from Tradier for this ticker"
                style={{
                  cursor: "pointer", fontSize: 12, lineHeight: 1, padding: "3px 6px", borderRadius: 5,
                  background: s.ivLive ? "#EDF7F0" : "#F8F7F4",
                  color: s.ivLive ? "#1E7A46" : "#8A8578",
                  border: s.ivLive ? "1px solid #BFE0CB" : "1px solid #DDD9CF",
                }}
              >
                {volLoading ? "…" : "↻"}
              </button>
            )}
          </span>
        </div>
        <IVMeter ivr={s.ivr} />
        {!s.ivLive && (
          <div style={{ fontSize: 9.5, color: "#C77E14", marginTop: 5, fontWeight: 700, letterSpacing: "0.05em" }}>
            {volLoading
              ? "LOADING LIVE VOL…"
              : s.iv == null
                ? "QUEUED FOR VOL — tap ↻ to jump the queue"
                : "⚠ SNAPSHOT VOL — tap ↻ for live IV/HV"}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 7, fontFamily: "'IBM Plex Mono', monospace" }}>
          <span style={{ fontSize: 11, color: "#5B6472" }}>
            IV <span style={{ fontWeight: 700, color: "#22282F" }}>{s.iv != null ? `${s.iv}%` : "—"}</span>
            <span style={{ color: "#B5B0A3", margin: "0 5px" }}>·</span>
            HV <span style={{ fontWeight: 700, color: "#22282F" }}>{s.hv != null ? `${s.hv}%` : "—"}</span>
            {(() => {
              if (s.iv == null || s.hv == null) return null;
              const gap = s.iv - s.hv;
              if (gap >= 5) return (
                <span title="IV above realized vol — options priced richer than actual movement. Premium-selling edge." style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#1E7A46", marginLeft: 6 }}>
                  +{gap} RICH
                </span>
              );
              if (gap <= -5) return (
                <span title="IV BELOW realized vol — options priced cheaper than the stock is actually moving. Do NOT sell premium here; favors buying vol." style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#2E6DA4", marginLeft: 6 }}>
                  {gap} CHEAP
                </span>
              );
              return (
                <span title="IV roughly equals realized vol — no meaningful vol edge either way." style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#8A8578", marginLeft: 6 }}>
                  FAIR
                </span>
              );
            })()}
          </span>
          <span style={{ fontSize: 10.5, color: erUnknown ? "#B03E1E" : "#8A8578" }}>
            {s.etf || s.earn === null
              ? "NO EARNINGS (ETF)"
              : erUnknown
                ? "⚠ ER DATE UNKNOWN"
                : erStale
                  ? "ER DATE NEEDS UPDATE"
                  : `NEXT ER ${fmtDate(s.earn)} (${erDays}D)`}
          </span>
        </div>

        {/* EXPIRY MAP — which expiration is actually clean, not a generic DTE band */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8A8578", fontWeight: 700, marginBottom: 5 }}>
            EXPIRY MAP
            {expiryRows[0]?.synthetic && (
              <span title="Estimated ladder — real expirations load with live vol data" style={{ color: "#C77E14", marginLeft: 5 }}>EST</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {expiryRows.slice(0, 4).map((e) => {
              const st = GRADE_STYLE[e.grade];
              const isBest = bestExpiry && e.expISO === bestExpiry.expISO;
              return (
                <div
                  key={e.expISO}
                  title={
                    (e.hasEarn ? "Earnings inside this expiration. " : "") +
                    (e.macro.length ? e.macro.map((m) => `${m.n} ${fmtDate(m.d)}`).join(" · ") : "No macro events before expiration.")
                  }
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                    padding: "4px 8px", borderRadius: 6,
                    background: isBest ? st.bg : "#FAFAF8",
                    border: isBest ? `1px solid ${st.bd}` : "1px solid #EFEDE7",
                  }}
                >
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#3A414C", whiteSpace: "nowrap" }}>
                    {fmtDate(e.expISO)}
                    <span style={{ color: "#A6A192", marginLeft: 5 }}>{e.dte}d</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                    <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: "#8A8578", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.tags.length ? e.tags.join(" ") : "no heavy prints"}{!e.hasEarn && e.heavy > 0 ? ` ·${e.heavy}` : ""}
                    </span>
                    <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.06em", color: st.fg, background: st.bg, border: `1px solid ${st.bd}`, borderRadius: 3, padding: "1px 5px", whiteSpace: "nowrap" }}>
                      {st.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {strats.map((st, i) => {
          const isPick = i === 2;
          return (
            <div
              key={st.name}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                padding: "7px 10px", borderRadius: 8,
                background: isPick ? "#EDF7F0" : "#F8F7F4",
                border: isPick ? "1px solid #BFE0CB" : "1px solid #EDEAE3",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: isPick ? "#1E7A46" : "#333A44" }}>
                  {st.name}
                </div>
                <div style={{ fontSize: 10, color: isPick ? "#4E9A6E" : "#8A8578" }}>{st.tag}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                {isPick && (
                  <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.1em", color: "#FFFFFF", background: "#1E8A4C", borderRadius: 4, padding: "3px 6px", whiteSpace: "nowrap" }}>
                    SMALL ACCT PICK
                  </span>
                )}
                <span style={{ fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace", color: isPick ? "#4E9A6E" : "#8A8578", whiteSpace: "nowrap" }}>
                  {/* The pick names the actual cleanest expiry instead of a generic DTE band */}
                  {isPick && bestExpiry
                    ? `${st.setup.split("·")[0].trim()} · ${fmtDate(bestExpiry.expISO)} (${bestExpiry.dte}d)`
                    : st.setup}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8A8578", fontWeight: 700, marginBottom: 2 }}>
          EXPECTED RANGE <span style={{ color: "#B5B0A3" }}>(1σ · IV {s.iv}%)</span>
        </div>
        <RangeRow label="1 DAY" price={s.p} iv={s.iv} days={1} />
        <RangeRow label="1 WEEK" price={s.p} iv={s.iv} days={7} />
        <RangeRow label="1 MONTH" price={s.p} iv={s.iv} days={30} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function OptionsScanner() {
  const [etfOnly, setEtfOnly] = useState(false);
  const [highIVOnly, setHighIVOnly] = useState(false);
  const [earningsOnly, setEarningsOnly] = useState(false);
  const [watchOnly, setWatchOnly] = useState(false);
  const [liquidOnly, setLiquidOnly] = useState(false);
  const [cleanOnly, setCleanOnly] = useState(false);
  const [shown, setShown] = useState(36);
  // Any filter or sort change snaps back to one page, so changing the screen never
  // silently queues hundreds of vol fetches for a freshly-widened list.
  const resetShown = () => setShown(36);
  const [watchlist, setWatchlist] = useState(() => new Set(["RKLB", "SPCX"]));
  const [sortKey, setSortKey] = useState("ivr");
  const [sortDir, setSortDir] = useState("desc");
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState(null);

  // ── LIVE DATA LAYER ──────────────────────────
  // live: null = loading · true = Tradier connected · false = snapshot fallback
  const [live, setLive] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [vol, setVol] = useState({});

  // Prices for the whole universe, fetched in chunks. One Tradier call per chunk keeps
  // a 542-name universe to ~6 requests, and each chunk paints as it lands.
  const QUOTE_CHUNK = 100;
  useEffect(() => {
    const syms = UNIVERSE.map((u) => u.t);
    const chunks = [];
    for (let i = 0; i < syms.length; i += QUOTE_CHUNK) chunks.push(syms.slice(i, i + QUOTE_CHUNK));
    let ok = 0, done = 0;
    chunks.forEach((c) => {
      fetch(`/api/quotes?symbols=${c.join(",")}`)
        .then((r) => { if (!r.ok) throw new Error("quotes failed"); return r.json(); })
        .then((q) => {
          if (q && !q.error) { ok++; setQuotes((prev) => ({ ...prev, ...q })); }
        })
        .catch(() => {})
        .finally(() => { if (++done === chunks.length) setLive(ok > 0); });
    });
  }, []);

  const refreshVol = (t) => {
    setVol((v) => ({ ...v, [t]: { ...(v[t] || {}), loading: true } }));
    fetch(`/api/vol?symbol=${t}`)
      .then((r) => r.json())
      .then((d) => setVol((v) => ({ ...v, [t]: d && !d.error ? d : { err: true } })))
      .catch(() => setVol((v) => ({ ...v, [t]: { err: true } })));
  };
  // ─────────────────────────────────────────────

  // First-click direction per sort key: numbers scan high→low, alphabet reads A→Z
  const FIRST_DIR = { ivr: "desc", chg: "desc", price: "desc", az: "asc" };

  const cycleSort = (id) => {
    if (sortKey !== id) {
      setSortKey(id);
      setSortDir(FIRST_DIR[id]);
    } else if (sortDir === FIRST_DIR[id]) {
      setSortDir(FIRST_DIR[id] === "desc" ? "asc" : "desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const toggleStar = (ticker) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });
  };

  const rows = useMemo(() => {
    // Merge live Tradier data over the snapshot baseline
    const merged = UNIVERSE.map((u) => {
      const q = quotes[u.t];
      const v = vol[u.t];
      if (!v || !v.iv) {
        return { ...u, ...(q && q.p != null ? { p: q.p, chg: q.chg != null ? q.chg : u.chg } : {}) };
      }
      const ivL = Math.round(v.iv);
      const hvL = v.hv ? Math.round(v.hv) : u.hv;
      // Real rank once history exists; otherwise estimate from the IV/HV relationship.
      // IV well above HV → vol is bid up → high rank. IV below HV → options are cheap → low rank.
      let rank = v.ivr;
      if (rank == null && hvL > 0) {
        const ratio = ivL / hvL;
        rank = Math.max(0, Math.min(100, Math.round((ratio - 0.7) * 125)));
      }
      return {
        ...u,
        ...(q && q.p != null ? { p: q.p, chg: q.chg != null ? q.chg : u.chg } : {}),
        iv: ivL,
        hv: hvL,
        ivr: rank != null ? rank : u.ivr,
        ivLive: true,
        ivTrend: v.ivTrend || null,
        iv5d: v.iv5d != null ? v.iv5d : null,
        ivRefDays: v.ivRefDays || null,
        expirations: v.expirations || null,
        ivrReal: v.ivr != null,
        liveLiq: v.liqTier || null,
        dte: v.dte,
      };
    });
    let list = merged.filter((s) => {
      if (etfOnly && !s.etf) return false;
      // Names without loaded vol can't be judged on IV — excluded rather than assumed low
      if (highIVOnly && !(s.ivr >= 50)) return false;
      if (earningsOnly && !earningsSoon(s)) return false;
      if (watchOnly && !watchlist.has(s.t)) return false;
      if (liquidOnly && (s.liveLiq ?? liq(s.t)) !== 3) return false;
      if (cleanOnly && !hasCleanExpiry(s)) return false;
      if (sectorFilter && TICKER_SECTOR[s.t] !== sectorFilter) return false;
      if (query && !(s.t.toLowerCase().includes(query.toLowerCase()) || s.n.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
    // Nulls (no live data yet) sort to the bottom on every key rather than reading as zero
    const nz = (v, dir) => (v == null ? (dir === "asc" ? Infinity : -Infinity) : v);
    const ascSorters = {
      az: (a, b) => a.t.localeCompare(b.t),
      chg: (a, b) => nz(a.chg, "asc") - nz(b.chg, "asc"),
      ivr: (a, b) => nz(a.ivr, "asc") - nz(b.ivr, "asc"),
      price: (a, b) => nz(a.p, "asc") - nz(b.p, "asc"),
    };
    // Sort off → liquidity-first: the most tradeable options markets float to the top
    if (!sortKey) return [...list].sort((a, b) => liqSort(b.t) - liqSort(a.t));
    const cmp = ascSorters[sortKey];
    // Liquidity is the tiebreaker on every sort
    return [...list].sort((a, b) => {
      const d = sortDir === "asc" ? cmp(a, b) : cmp(b, a);
      return d !== 0 ? d : liqSort(b.t) - liqSort(a.t);
    });
  }, [etfOnly, highIVOnly, earningsOnly, watchOnly, liquidOnly, cleanOnly, watchlist, sortKey, sortDir, query, sectorFilter, quotes, vol]);

  // Only render a slice — 542 cards at once is a scroll wall and a layout cost for nothing
  const visible = rows.slice(0, shown);

  // ── ON-DEMAND VOL ────────────────────────────
  // 542 tickers × 4 Tradier calls each would be ~2,000 requests against a ~60/min ceiling.
  // So vol loads only for cards actually on screen, paced at 5s. Filter first, and the
  // queue follows you: pick a sector, the names in it fill in. Nothing else is fetched.
  useEffect(() => {
    if (live !== true) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const next = visible.find((s) => !vol[s.t]);
      if (!next) return;
      setVol((v) => (v[next.t] ? v : { ...v, [next.t]: { loading: true } }));
      fetch(`/api/vol?symbol=${next.t}`)
        .then((r) => r.json())
        .then((d) => setVol((v) => ({ ...v, [next.t]: d && !d.error ? d : { err: true } })))
        .catch(() => setVol((v) => ({ ...v, [next.t]: { err: true } })));
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, [live, visible, vol]);

  const pendingVol = visible.filter((s) => !vol[s.t] || vol[s.t].loading).length;

  const toggles = [
    { label: "ETFs only", on: etfOnly, set: setEtfOnly },
    { label: "High IV only", on: highIVOnly, set: setHighIVOnly },
    { label: "Earnings only", on: earningsOnly, set: setEarningsOnly },
    { label: "●●● Liquid only", on: liquidOnly, set: setLiquidOnly },
    { label: "Clean expiry", on: cleanOnly, set: setCleanOnly },
    { label: `★ Watchlist (${watchlist.size})`, on: watchOnly, set: setWatchOnly },
  ];

  const sorts = [
    { id: "ivr", label: "IV Rank" },
    { id: "chg", label: "% Change" },
    { id: "price", label: "Price" },
    { id: "az", label: "A–Z" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F4F0", fontFamily: "'Inter', -apple-system, sans-serif", color: "#22282F" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #DD8A1733; }
        button:focus-visible, input:focus-visible { outline: 2px solid #DD8A17; outline-offset: 2px; }
        input::placeholder { color: #A6A192; }
      `}</style>

      <div style={{ borderBottom: "1px solid #E7E4DC", padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", background: "#FDFCFA" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#DD8A17", boxShadow: "0 0 0 4px #DD8A1722" }} />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", color: "#22282F" }}>PREMIUM HUNTER</h1>
          </div>
          <div style={{ fontSize: 11.5, color: "#8A8578", marginTop: 3, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em", borderRadius: 4, padding: "2px 7px",
                color: "#FFFFFF",
                background: live === true ? "#1E8A4C" : live === false ? "#C77E14" : "#8A8578",
              }}
            >
              {live === true ? "● LIVE · TRADIER" : live === false ? "● SNAPSHOT MODE" : "● CONNECTING…"}
            </span>
            <span>
              {live === true
                ? "prices live (15-min delayed) · tap ↻ on a card for real IV/HV"
                : "educational snapshot · deploy with a Tradier key for live data"}
              {" · not financial advice"}
            </span>
          </div>
        </div>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); resetShown(); }}
          placeholder="Search ticker or name…"
          style={{
            background: "#FFFFFF", border: "1px solid #DDD9CF", borderRadius: 8, padding: "9px 14px",
            fontSize: 13, color: "#22282F", width: 230, fontFamily: "'IBM Plex Mono', monospace",
          }}
        />
      </div>

      <MacroStrip />

      <SectorRotation active={sectorFilter} onSelect={(v) => { setSectorFilter(v); resetShown(); }} />

      <div style={{ padding: "14px 24px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", borderBottom: "1px solid #ECE9E1", background: "#FAF9F6", marginTop: 14 }}>
        {toggles.map((tg) => (
          <button
            key={tg.label}
            onClick={() => { tg.set(!tg.on); resetShown(); }}
            style={{
              cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
              padding: "8px 14px", borderRadius: 999,
              background: tg.on ? "#DD8A17" : "#FFFFFF",
              color: tg.on ? "#FFFFFF" : "#5B5646",
              border: tg.on ? "1px solid #DD8A17" : "1px solid #DDD9CF",
              transition: "all .15s ease",
            }}
          >
            {tg.on ? "● " : "○ "}{tg.label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#8A8578", fontWeight: 700 }}>SORT BY</span>
          {sorts.map((s) => {
            const on = sortKey === s.id;
            const arrow = on ? (sortDir === "desc" ? " ↓" : " ↑") : "";
            return (
              <button
                key={s.id}
                onClick={() => { cycleSort(s.id); resetShown(); }}
                title="Click: high→low · again: low→high · again: off"
                style={{
                  cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 8,
                  background: on ? "#EFEBE1" : "transparent",
                  color: on ? "#22282F" : "#8A8578",
                  border: on ? "1px solid #D8D2C2" : "1px solid transparent",
                }}
              >
                {s.label}{arrow}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "14px 24px 0", fontSize: 12, color: "#8A8578", fontFamily: "'IBM Plex Mono', monospace" }}>
        {rows.length} {rows.length === 1 ? "name" : "names"} matched
        {rows.length > visible.length && ` · showing ${visible.length}`}
        {pendingVol > 0 && live === true && ` · loading vol ${visible.length - pendingVol}/${visible.length}`}
        {highIVOnly && " · IV Rank ≥ 50"}
        {earningsOnly && ` · earnings within ${EARNINGS_SOON_DAYS} days`}
        {watchOnly && " · watchlist"}
        {cleanOnly && " · clean expiry available"}
        {sectorFilter && (
          <>
            {" · "}
            <span style={{ color: "#22282F", fontWeight: 700 }}>
              {SECTOR_NAME[sectorFilter]} ({sectorFilter})
            </span>
            <button
              onClick={() => setSectorFilter(null)}
              style={{ cursor: "pointer", marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#B03E1E", background: "#FBEEE8", border: "1px solid #F0CDBD", borderRadius: 6, padding: "2px 8px" }}
            >
              ✕ clear sector
            </button>
          </>
        )}
      </div>

      <div
        style={{
          padding: 24, display: "grid", gap: 16,
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
        }}
      >
        {visible.map((s) => (
          <StockCard
            key={s.t}
            s={s}
            watched={watchlist.has(s.t)}
            onStar={toggleStar}
            onSector={(v) => { setSectorFilter(v); resetShown(); }}
            onVol={live === true ? refreshVol : null}
            volLoading={!!(vol[s.t] && vol[s.t].loading)}
          />
        ))}
      </div>

      {rows.length > visible.length && (
        <div style={{ padding: "0 24px 28px", textAlign: "center" }}>
          <button
            onClick={() => setShown((n) => n + 36)}
            style={{
              cursor: "pointer", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em",
              padding: "10px 20px", borderRadius: 999, background: "#FFFFFF",
              color: "#5B5646", border: "1px solid #DDD9CF",
            }}
          >
            Show 36 more · {rows.length - visible.length} left
          </button>
          <div style={{ fontSize: 10.5, color: "#A6A192", marginTop: 8 }}>
            Vol data loads only for cards on screen — filter down before loading more.
          </div>
        </div>
      )}

      {rows.length === 0 && (
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#8A8578", fontSize: 14 }}>
          Nothing matches these filters. Turn one off to widen the screen.
        </div>
      )}

      <div style={{ padding: "0 24px 28px", fontSize: 11, color: "#A6A192", maxWidth: 760 }}>
        Universe: the S&P 500 plus ETFs and non-index names already tracked (542 total). Prices load for everything at
        once; IV, HV, liquidity and the expiry map load only for the cards on screen, because grading all 542 would be
        ~2,000 Tradier calls against a ~60/min limit. Filter first, then let the queue fill. Names carrying "—" simply
        haven't been fetched yet. Liquidity shows UNSCORED until graded from live volume, open interest and spread
        width. Earnings dates are on file for the originally curated names; index names added in bulk show ER DATE
        UNKNOWN and are never graded as a clean expiry until a real date is confirmed.
        Expiry map grades each expiration by what it spans: EARNINGS (report inside it), then CLEAN / LIGHT / BUSY /
        LOADED by count of heavy macro prints. Grading is relative — a 30–45 DTE expiry always spans two or three
        events, so the ► row is the least-encumbered choice on that ticker, not a risk-free one. Macro dates are the
        Fed's published FOMC calendar and the BLS release schedule; earnings dates are maintained in-app and flagged
        when stale. IV direction compares today's IV against the reading ~5 sessions back from this app's own stored
        history, so it appears once a ticker has a few days logged.
        IV Rank = (current IV − 52-wk IV low) ÷ (52-wk IV high − 52-wk IV low) × 100. "RICH" flags IV above 30-day
        historical volatility. Expected ranges are 1σ moves: price × IV × √(days/365). Liquidity dots: ●●● ELITE
        (penny-wide spreads, deep volume/OI), ●●○ GOOD (tradeable with limit orders), ●○○ THIN (avoid in small
        accounts) — the live version will score this from real option volume, open interest, and bid-ask spread width.
        Prices are an Aug 5, 2026 snapshot (anchored tickers verified, others estimated); IV, HV, IV Rank, and sector
        rotation figures are illustrative until connected to a live data feed. Verify everything against thinkorswim
        before placing paper trades.
      </div>
    </div>
  );
}
