/** ALYM Manager Career — registre exhaustif des écrans (625) */
export type ModuleId =
  | 'launch' | 'career_create' | 'central' | 'live' | 'calendar' | 'squad'
  | 'player' | 'tactics' | 'match_preview' | 'match_live' | 'match_end'
  | 'transfers' | 'scouting' | 'youth' | 'mgrmarket' | 'board' | 'finance'
  | 'staff' | 'news' | 'events' | 'competitions' | 'analytics' | 'club'
  | 'season' | 'world' | 'search' | 'settings' | 'overlays' | 'premium';

export type ScreenDef = {
  id: number;
  key: string;
  name: string;
  module: ModuleId;
  kind: 'screen' | 'sub' | 'overlay' | 'state';
};

export const MODULES: { id: ModuleId; label: string; icon: string }[] = [
  { id: 'central', label: 'Central', icon: '⌂' },
  { id: 'live', label: 'Live', icon: '◉' },
  { id: 'squad', label: 'Effectif', icon: '☰' },
  { id: 'tactics', label: 'Tactique', icon: '▦' },
  { id: 'match_live', label: 'Match', icon: '▶' },
  { id: 'transfers', label: 'Mercato', icon: '⇄' },
  { id: 'scouting', label: 'Scouting', icon: '◎' },
  { id: 'youth', label: 'Jeunes', icon: '◇' },
  { id: 'mgrmarket', label: 'Mgr Market', icon: '◎' },
  { id: 'board', label: 'Conseil', icon: '▣' },
  { id: 'finance', label: 'Finances', icon: '€' },
  { id: 'staff', label: 'Staff', icon: '☷' },
  { id: 'news', label: 'Actus', icon: '✉' },
  { id: 'calendar', label: 'Calendrier', icon: '▦' },
  { id: 'competitions', label: 'Compétitions', icon: '🏆' },
  { id: 'analytics', label: 'Analytics', icon: '◔' },
  { id: 'club', label: 'Club', icon: '⬡' },
  { id: 'season', label: 'Saison', icon: '◎' },
  { id: 'world', label: 'Monde', icon: '○' },
  { id: 'settings', label: 'Réglages', icon: '⚙' },
  { id: 'premium', label: 'Legacy', icon: '★' },
];

// Generated registry from user list (ids 1-625)
const RAW: [number, string, string, ModuleId, ScreenDef['kind']][] = [
  // 1. LAUNCH 1-17
  [1,'splash','Splash Screen','launch','screen'],
  [2,'main_menu','Main Menu','launch','screen'],
  [3,'game_mode','Game Mode Selection','launch','screen'],
  [4,'mgr_career_sel','Manager Career Selection','launch','screen'],
  [5,'live_hub','Manager Live Hub','live','screen'],
  [6,'live_list','Live Challenge List','live','screen'],
  [7,'live_details','Live Challenge Details','live','sub'],
  [8,'live_rules','Live Challenge Rules','live','sub'],
  [9,'live_objectives','Live Challenge Objectives','live','sub'],
  [10,'live_progress','Live Challenge Progress','live','sub'],
  [11,'live_completed','Live Challenge Completed','live','state'],
  [12,'live_failed','Live Challenge Failed','live','state'],
  [13,'original_career','Original Career Selection','launch','screen'],
  [14,'continue_career','Continue Career','launch','screen'],
  [15,'load_career','Load Career','launch','screen'],
  [16,'save_career','Save Career','launch','overlay'],
  [17,'career_files','Career File Management','launch','screen'],
  // 2. CAREER CREATE 18-51
  [18,'choose_club','Choose Club','career_create','screen'],
  [19,'search_club','Search Club','career_create','sub'],
  [20,'club_filters','Club Filters','career_create','overlay'],
  [21,'club_details','Club Details','career_create','sub'],
  [22,'club_overview','Club Overview Before Career','career_create','screen'],
  [23,'create_club','Create Your Club','career_create','screen'],
  [24,'club_name','Club Name','career_create','sub'],
  [25,'club_short','Club Short Name','career_create','sub'],
  [26,'club_badge','Club Badge','career_create','sub'],
  [27,'club_colors','Club Colors','career_create','sub'],
  [28,'club_kits','Club Kits','career_create','sub'],
  [29,'stadium_sel','Stadium Selection','career_create','sub'],
  [30,'rival_sel','Rival Selection','career_create','sub'],
  [31,'club_philosophy','Club Philosophy','career_create','sub'],
  [32,'manager_sel','Manager Selection','career_create','screen'],
  [33,'create_manager','Create Manager','career_create','screen'],
  [34,'mgr_appearance','Manager Appearance','career_create','sub'],
  [35,'mgr_clothing','Manager Clothing','career_create','sub'],
  [36,'mgr_name','Manager Name','career_create','sub'],
  [37,'mgr_nation','Manager Nationality','career_create','sub'],
  [38,'mgr_profile','Manager Profile','career_create','sub'],
  [39,'mgr_philosophy','Manager Philosophy','career_create','sub'],
  [40,'mgr_tactical','Manager Tactical Style','career_create','sub'],
  [41,'career_settings','Career Settings','career_create','screen'],
  [42,'gameplay_settings','Gameplay Settings','career_create','sub'],
  [43,'financial_settings','Financial Settings','career_create','sub'],
  [44,'transfer_settings','Transfer Settings','career_create','sub'],
  [45,'difficulty_settings','Difficulty Settings','career_create','sub'],
  [46,'match_settings','Match Settings','career_create','sub'],
  [47,'board_expectations','Board Expectations','career_create','sub'],
  [48,'starting_objectives','Starting Objectives','career_create','sub'],
  [49,'career_summary','Career Summary','career_create','screen'],
  [50,'confirm_career','Confirm Career','career_create','screen'],
  [51,'career_loading','Career Loading','career_create','state'],
  // 3. CENTRAL 52-76
  [52,'central_home','Central Home','central','screen'],
  [53,'mgr_dashboard','Manager Dashboard','central','screen'],
  [54,'next_match','Next Match','central','sub'],
  [55,'next_match_exp','Next Match Expanded','central','sub'],
  [56,'prev_match','Previous Match','central','sub'],
  [57,'recent_results','Recent Results','central','sub'],
  [58,'current_form','Current Form','central','sub'],
  [59,'league_snapshot','League Snapshot','central','sub'],
  [60,'comp_snapshot','Competition Snapshot','central','sub'],
  [61,'board_confidence','Board Confidence','central','sub'],
  [62,'mgr_rating','Manager Rating','central','sub'],
  [63,'mgr_tasks','Manager Tasks','central','sub'],
  [64,'priority_tasks','Priority Tasks','central','sub'],
  [65,'pending_decisions','Pending Decisions','central','sub'],
  [66,'recent_activity','Recent Activity','central','sub'],
  [67,'latest_news','Latest News','central','sub'],
  [68,'breaking_news','Breaking News','central','sub'],
  [69,'inbox_preview','Inbox Preview','central','sub'],
  [70,'transfer_preview','Transfer Activity Preview','central','sub'],
  [71,'injury_preview','Injury Preview','central','sub'],
  [72,'training_preview','Training Preview','central','sub'],
  [73,'calendar_preview','Calendar Preview','central','sub'],
  [74,'upcoming_events','Upcoming Events','central','sub'],
  [75,'club_obj_preview','Club Objectives Preview','central','sub'],
  [76,'season_overview','Season Overview','central','sub'],
];

// Auto-expand remaining modules with sequential keys for completeness
function bulk(
  start: number,
  end: number,
  module: ModuleId,
  names: string[],
  kind: ScreenDef['kind'] = 'screen'
): [number, string, string, ModuleId, ScreenDef['kind']][] {
  const out: [number, string, string, ModuleId, ScreenDef['kind']][] = [];
  for (let i = start; i <= end; i++) {
    const name = names[i - start] || `Screen ${i}`;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `s_${i}`;
    out.push([i, `${key}_${i}`, name, module, kind]);
  }
  return out;
}

const MORE: [number, string, string, ModuleId, ScreenDef['kind']][] = [
  ...bulk(77, 92, 'live', [
    'Manager Live Home','For You','Starters','Featured Challenges','Popular Challenges','Challenge Search','Challenge Filters',
    'Challenge Details','Challenge Context','Challenge Objectives','Challenge Rules','Challenge Restrictions','Challenge Rewards',
    'Challenge Progress','Challenge Results','Challenge History',
  ]),
  ...bulk(93, 106, 'calendar', [
    'Calendar Month','Calendar Week','Calendar Day','Season Calendar','Fixture List','Training Calendar','Match Day Calendar',
    'Transfer Window Calendar','Competition Calendar','International Break Calendar','Deadline Calendar','Event Details',
    'Calendar Match Preview','Calendar Training Details',
  ]),
  ...bulk(107, 130, 'squad', [
    'Squad Hub','Squad Overview','Starting XI','Bench','Reserves','Full Squad List','Squad Grid','Squad Table','Squad Depth',
    'Position Overview','Player Selection','Substitute Selection','Squad Comparison','Squad Filters','Squad Search','Squad Sort',
    'Squad Status','Player Availability','Player Fitness Overview','Player Morale Overview','Player Form Overview','Squad Roles',
    'Squad Numbers','Registration Status',
  ]),
  ...bulk(131, 173, 'player', [
    'Player Overview','Player Card','Player Bio','Player Attributes','Technical Attributes','Physical Attributes','Mental Attributes',
    'Goalkeeping Attributes','Tactical Attributes','Player Stats','Season Stats','Career Stats','Competition Stats','Match-by-Match Stats',
    'Player Form','Player Fitness','Player Morale','Player Development','Player Potential','Player Projection','Player Growth',
    'Development Plan','Training Focus','Player Position','Player Role','Player Contract','Contract Status','Salary Details',
    'Release Clause','Contract Negotiation','Player Value','Transfer Value History','Player History','Previous Clubs','Awards',
    'Injuries','Injury History','Suspension History','Player Comparison','Compare Players','Player Notes','Player Shortlist','Player Actions Menu',
  ]),
  ...bulk(174, 205, 'tactics', [
    'Tactics Hub','Tactical Overview','Formation Selection','Tactical Presets','Tactical Vision','Build-Up Style','Defensive Approach',
    'Transition Settings','Attacking Settings','Width Settings','Defensive Line Settings','Pressing Settings','Possession Settings',
    'Chance Creation','Player Roles','Player Instructions','Position Instructions','Attacking Instructions','Defensive Instructions',
    'Set Pieces','Corners','Free Kicks','Penalties','Captain Selection','Set-Piece Takers','Team Sheet','Alternate Team Sheet',
    'Squad Tactics','Tactical Preset Save','Tactical Preset Edit','Tactical Preset Delete','Tactical Changes Confirmation',
  ]),
  ...bulk(206, 223, 'match_preview', [
    'Match Preview','Match Details','Competition Details','Venue Details','Weather','Referee','Match Importance','Team Form Comparison',
    'League Position Comparison','Head-to-Head','Opponent Overview','Opponent Lineup','Opponent Tactical Analysis','Opponent Key Players',
    'Match Objectives','Pre-Match Team Talk','Starting XI Confirmation','Bench Confirmation',
  ]),
  ...bulk(224, 260, 'match_live', [
    'Match Intro','Match Presentation','Live Match HUD','Scoreboard','Match Clock','Match Events','Match Timeline','Goal Event',
    'Assist Event','Yellow Card Event','Red Card Event','Substitution Event','Injury Event','VAR Event','Half-Time','Half-Time Statistics',
    'Half-Time Team Talk','Tactical Adjustment','Substitution Screen','Player Instructions During Match','Match Statistics','Possession',
    'Shots','Shots on Target','xG','Passing','Tackles','Fouls','Cards','Corners','Offsides','Player Ratings','Player Performance',
    'Tactical Overview During Match','Pause Menu','Match Settings','Quit Match Confirmation',
  ]),
  ...bulk(261, 276, 'match_end', [
    'Full-Time Result','Match Summary','Match Statistics','Player Ratings','Team Ratings','Key Moments','Match Timeline Summary',
    'Post-Match Tactical Analysis','Post-Match Player Performance','Injuries Report','Suspension Report','Press Conference',
    'Post-Match Interview','Board Reaction','Fan Reaction','Match Rewards/Consequences',
  ]),
  ...bulk(277, 316, 'transfers', [
    'Transfer Hub','Transfer Overview','Transfer Search','Advanced Search','Search by Position','Search by Age','Search by Rating',
    'Search by Potential','Search by Value','Search by Contract','Search by League','Search by Nation','Transfer Results','Transfer Shortlist',
    'Transfer Target Profile','Transfer Interest','Transfer Availability','Incoming Offers','Outgoing Offers','Transfer Offer','Bid Amount',
    'Negotiation','Transfer Negotiation','Player Wage Negotiation','Contract Length Negotiation','Release Clause Negotiation','Loan Offer',
    'Loan Negotiation','Loan Terms','Swap Proposal','Transfer Accepted','Transfer Rejected','Counter Offer','Transfer Completed',
    'Transfer Cancelled','Transfer History','Transfer Deadline Day','Deadline Day Activity','Transfer News','Transfer Rumours',
  ]),
  ...bulk(317, 340, 'scouting', [
    'Scouting Hub','Scout Network','Scout Overview','Scout Assignment','Create Scout Assignment','Country Scouting','Region Scouting',
    'League Scouting','Position Scouting','Age Scouting','Attribute Scouting','Potential Scouting','Scout Results','Scout Targets',
    'Scout Report','Detailed Scout Report','Player Recommendation','Scout Confidence','Scouting Progress','Scouting History',
    'Data-Driven Scouting','Player Analytics Report','Recruitment Recommendation','Shortlist from Scouting',
  ]),
  ...bulk(341, 362, 'youth', [
    'Youth Academy Hub','Youth Squad','Youth Player List','Youth Player Profile','Youth Attributes','Youth Potential','Youth Projection',
    'Youth Development','Youth Training','Youth Tournament','Youth Match','Youth Performance','Youth Scout Network','Youth Scout Assignment',
    'Youth Scout Results','Youth Scout Report','Promote Youth Player','Release Youth Player','Youth Contract','Academy Overview',
    'Academy Progress','Academy History',
  ]),
  ...bulk(363, 384, 'mgrmarket', [
    'Manager Market Hub','Available Managers','Manager Search','Manager Filters','Manager Profile','Manager Reputation','Manager Tactical Style',
    'Manager Career History','Manager Job Openings','Job Suggestions','Job Shortlist','Manager Vacancy','Job Offer','Job Interview',
    'Job Negotiation','Manager Appointment','Manager Dismissal','Manager Resignation','Caretaker Manager','Manager Movement',
    'Manager Market News','Manager Market History',
  ]),
  ...bulk(385, 404, 'board', [
    'Board Hub','Board Objectives','Objective Details','Objective Progress','Board Confidence','Job Security','Performance Review',
    'Financial Objectives','League Objectives','Cup Objectives','Continental Objectives','Youth Objectives','Brand Objectives',
    'Development Objectives','Board Meeting','Board Decision','Board Warning','Board Ultimatum','Board Evaluation','Manager Dismissal Warning',
  ]),
  ...bulk(405, 423, 'finance', [
    'Finance Hub','Financial Overview','Transfer Budget','Wage Budget','Revenue','Expenses','Salaries','Transfer Spending','Transfer Income',
    'Match Revenue','Commercial Revenue','Sponsorship','Stadium Revenue','Financial Forecast','Financial History','Budget Allocation',
    'Wage Structure','Payroll Overview','Financial Report',
  ]),
  ...bulk(424, 438, 'staff', [
    'Staff Hub','Coaching Staff','Assistant Manager','Scouts','Medical Staff','Performance Staff','Staff List','Staff Profile',
    'Staff Attributes','Staff Hiring','Staff Search','Staff Contract','Staff Development','Staff Management','Staff Budget',
  ]),
  ...bulk(439, 457, 'news', [
    'News Hub','News Feed','Breaking News','Club News','Transfer News','League News','Competition News','Manager News','Player News',
    'Injury News','Youth News','World Football News','Inbox','Message List','Message Detail','Decision Message','Action Required',
    'Archived Messages','News Filters',
  ]),
  ...bulk(458, 475, 'events', [
    'Event Alert','Event Details','Event Decision','Event Choices','Event Consequences','Event Outcome','Event History','Player Conflict',
    'Player Unhappiness','Dressing Room Issue','Media Pressure','Board Pressure','Financial Crisis','Injury Crisis','Transfer Drama',
    'Breakthrough Talent','Staff Conflict','Unexpected Opportunity',
  ]),
  ...bulk(476, 490, 'competitions', [
    'Competition Hub','League Table','Form Table','Fixtures','Results','Competition Bracket','Group Stage','Knockout Stage',
    'Competition Stats','Top Scorers','Top Assists','Clean Sheets','Player Leaders','Team Leaders','Competition History',
  ]),
  ...bulk(491, 505, 'analytics', [
    'Team Analytics','Player Analytics','Attacking Analytics','Defensive Analytics','Possession Analytics','Passing Analytics',
    'Chance Creation Analytics','xG Analytics','Performance Trends','Form Trends','Player Development Trends','Financial Analytics',
    'Transfer Analytics','Scouting Analytics','Comparative Analytics',
  ]),
  ...bulk(506, 521, 'club', [
    'Club Hub','Club Overview','Club History','Club Honours','Club Records','Club Identity','Stadium','Stadium Overview','Facilities',
    'Training Facilities','Youth Facilities','Medical Facilities','Rivalries','Club Reputation','Club Finances','Club Objectives',
  ]),
  ...bulk(522, 540, 'season', [
    'Season Overview','Season Progress','Season Statistics','Season Results','Season Awards','Player Awards','Team Awards','Manager Awards',
    'Season Financial Review','Board Season Review','Manager Season Review','Final League Position','Competition Review','Season Highlights',
    'Season Low Points','Season Summary','Next Season Objectives','Season Transition','New Season Setup',
  ]),
  ...bulk(541, 553, 'world', [
    'World Football Hub','World Transfer Market','Major Transfers','Manager Movements','League Overview','Global Rankings','Top Players',
    'Rising Stars','Top Scorers Worldwide','World News','Major Matches','Upcoming Big Games','Global Competition Overview',
  ]),
  ...bulk(554, 565, 'search', [
    'Global Search','Player Search','Club Search','Manager Search','Staff Search','Search Filters','Advanced Filters','Sort Options',
    'Compare Players','Compare Clubs','Compare Managers','Compare Staff',
  ]),
  ...bulk(566, 580, 'settings', [
    'Settings','Gameplay Settings','Career Settings','Visual Settings','Audio Settings','Accessibility','Language','Notifications',
    'Controls','Account','Save Management','Cloud Save','Data Management','Privacy','Credits',
  ]),
  ...bulk(581, 605, 'overlays', [
    'Global Notification','Success Toast','Error Toast','Warning Toast','Confirmation Modal','Delete Confirmation','Transfer Confirmation',
    'Contract Confirmation','Player Action Menu','Quick Action Menu','Context Menu','Dropdown','Filter Drawer','Search Drawer',
    'Player Comparison Drawer','Negotiation Modal','Decision Modal','Event Modal','Loading Screen','Skeleton Screen','Empty State',
    'No Results State','Error State','Offline State','Unsaved Changes Warning',
  ], 'overlay'),
  ...bulk(606, 625, 'premium', [
    'Manager Career Timeline','Manager Legacy','Career Achievements','Club Culture','Dressing Room','Player Relationships','Team Chemistry',
    'Tactical DNA','Club Vision','Recruitment Philosophy','Manager Philosophy','Football World Timeline','Transfer Rumour Center',
    'Media Center','Press Room','Fan Sentiment','Board Relationship','Player Happiness Center','Dressing Room Morale','Club Power Ranking',
  ]),
];

export const ALL_SCREENS: ScreenDef[] = [...RAW, ...MORE].map(([id, key, name, module, kind]) => ({
  id, key, name, module, kind,
}));

export function screensByModule(module: ModuleId): ScreenDef[] {
  return ALL_SCREENS.filter((s) => s.module === module);
}

export function screenById(id: number): ScreenDef | undefined {
  return ALL_SCREENS.find((s) => s.id === id);
}

export const SCREEN_COUNT = ALL_SCREENS.length;
