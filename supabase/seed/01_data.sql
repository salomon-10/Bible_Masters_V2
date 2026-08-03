-- Données converties depuis if0_41655329_bible_master.sql (InfinityFree MySQL)
-- Généré automatiquement -- ne pas éditer à la main, régénérer si besoin.

-- tournaments
insert into tournaments (id, name, is_active, created_at) values (10, 'BIBLE MASTER 2026', true, '2026-04-26 00:05:31');

-- teams (logo_path calculé, fichiers correspondants dans supabase/seed/logos/)
insert into teams (id, tournament_id, name, logo_path, created_at) values (23, 10, 'Victorious', '10/23.png', '2026-04-26 00:05:44');
insert into teams (id, tournament_id, name, logo_path, created_at) values (24, 10, 'Guerriers de Dieu', '10/24.png', '2026-04-26 00:05:53');
insert into teams (id, tournament_id, name, logo_path, created_at) values (25, 10, 'GOD Avengers', '10/25.png', '2026-04-26 00:06:02');
insert into teams (id, tournament_id, name, logo_path, created_at) values (26, 10, 'BAROUCK', '10/26.png', '2026-04-26 00:06:14');
insert into teams (id, tournament_id, name, logo_path, created_at) values (27, 10, 'Petites fourmis de Dieu', '10/27.png', '2026-04-26 00:06:23');
insert into teams (id, tournament_id, name, logo_path, created_at) values (28, 10, 'SKY Warriors', '10/28.png', '2026-04-26 00:06:32');
insert into teams (id, tournament_id, name, logo_path, created_at) values (29, 10, 'Flamme de Vie', '10/29.png', '2026-04-26 00:06:54');
insert into teams (id, tournament_id, name, logo_path, created_at) values (30, 10, 'Missionnaires de Dieu', '10/30.png', '2026-04-26 00:07:04');

-- pools
insert into pools (id, tournament_id, name, created_at) values (8, 10, 'GROUPE A', '2026-04-26 00:07:29');
insert into pools (id, tournament_id, name, created_at) values (9, 10, 'GROUPE B', '2026-04-26 00:07:35');

-- pool_teams (lignes orphelines filtrées -- voir supabase/seed/orphaned_pool_teams.txt)
insert into pool_teams (id, pool_id, team_id, created_at) values (18, 8, 27, '2026-04-26 00:07:50');
insert into pool_teams (id, pool_id, team_id, created_at) values (19, 8, 26, '2026-04-26 00:07:59');
insert into pool_teams (id, pool_id, team_id, created_at) values (20, 8, 25, '2026-04-26 00:08:10');
insert into pool_teams (id, pool_id, team_id, created_at) values (21, 8, 28, '2026-04-26 00:08:24');
insert into pool_teams (id, pool_id, team_id, created_at) values (22, 9, 29, '2026-04-26 00:08:32');
insert into pool_teams (id, pool_id, team_id, created_at) values (23, 9, 24, '2026-04-26 00:08:38');
insert into pool_teams (id, pool_id, team_id, created_at) values (24, 9, 30, '2026-04-26 00:08:44');
insert into pool_teams (id, pool_id, team_id, created_at) values (25, 9, 23, '2026-04-26 00:08:50');

-- matches
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (21, 10, 30, 29, '2026-04-26', '00:00:00', 'Termine', 'Poule', 'legacy', 110, 200, true, '2026-04-26 00:09:29', '2026-04-26 08:36:29');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (23, 10, 27, 25, '2026-04-26', '00:00:00', 'Termine', 'Poule', 'legacy', 70, 210, true, '2026-04-26 00:10:12', '2026-04-26 08:48:58');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (24, 10, 28, 26, '2026-04-26', '00:00:00', 'Termine', 'Poule', 'legacy', 50, 90, true, '2026-04-26 00:10:29', '2026-04-26 08:38:59');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (26, 10, 23, 24, '2026-04-26', '00:00:00', 'Termine', 'Poule', 'legacy', 230, 160, true, '2026-04-26 10:31:13', '2026-04-26 10:33:34');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (28, 10, 29, 23, '2026-05-31', '00:00:00', 'Termine', 'Poule', 'legacy', 190, 190, true, '2026-04-26 17:11:31', '2026-05-31 08:40:00');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (29, 10, 24, 30, '2026-05-31', '00:00:00', 'Termine', 'Poule', 'legacy', 200, 190, true, '2026-04-26 17:11:49', '2026-05-31 08:28:13');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (30, 10, 25, 26, '2026-05-31', '00:00:00', 'Termine', 'Poule', 'legacy', 280, 250, true, '2026-04-26 17:12:29', '2026-05-31 08:30:47');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (31, 10, 27, 28, '2026-05-31', '00:00:00', 'Termine', 'Poule', 'legacy', 160, 210, true, '2026-04-26 17:13:14', '2026-05-31 08:53:55');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (32, 10, 29, 24, '2026-06-28', '00:00:00', 'Termine', 'Poule', 'legacy', 130, 100, true, '2026-06-28 06:14:41', '2026-06-28 08:45:31');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (33, 10, 30, 23, '2026-06-28', '00:00:00', 'Termine', 'Poule', 'legacy', 60, 140, true, '2026-06-28 06:18:21', '2026-06-28 08:47:09');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (34, 10, 25, 28, '2026-06-28', '00:00:00', 'Termine', 'Poule', 'legacy', 160, 100, true, '2026-06-28 06:19:35', '2026-06-28 08:42:44');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (35, 10, 27, 26, '2026-06-28', '00:00:00', 'Termine', 'Poule', 'legacy', 80, 140, true, '2026-06-28 06:22:08', '2026-06-28 08:51:20');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (36, 10, 25, 29, '2026-07-26', '00:00:00', 'Termine', 'Demi', 'demi_2026', 130, 110, true, '2026-07-25 13:14:26', '2026-07-26 09:37:44');
insert into matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, phase, trial_template, score_team1, score_team2, published, created_at, updated_at) values (37, 10, 26, 23, '2026-07-26', '00:00:00', 'Termine', 'Demi', 'demi_2026', 160, 60, true, '2026-07-25 13:15:58', '2026-07-26 08:23:51');

-- match_trials (lignes orphelines filtrées -- voir supabase/seed/orphaned_match_trials.txt)
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (122, 21, 1, 'Tiree de l''epee', 10, 30, '2026-04-26 00:10:51', '2026-04-26 08:10:38');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (123, 21, 2, 'Identification', 20, 0, '2026-04-26 00:10:51', '2026-04-26 08:13:23');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (124, 21, 3, 'Collectives 1', 40, 40, '2026-04-26 00:10:51', '2026-04-26 08:16:47');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (125, 21, 4, 'Vrai ou Faux', 30, 30, '2026-04-26 00:10:51', '2026-04-26 08:24:22');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (126, 21, 5, 'Cascades', 10, 20, '2026-04-26 00:10:51', '2026-04-26 08:29:50');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (127, 21, 6, 'Collectives 2', 0, 80, '2026-04-26 00:10:51', '2026-04-26 08:35:09');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (128, 23, 1, 'Tiree de l''epee', 10, 30, '2026-04-26 03:18:28', '2026-04-26 08:07:52');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (129, 23, 2, 'Identification', 0, 40, '2026-04-26 03:18:28', '2026-04-26 08:15:28');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (130, 23, 3, 'Collectives 1', 20, 10, '2026-04-26 03:18:28', '2026-04-26 08:24:05');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (131, 23, 4, 'Vrai ou Faux', 30, 40, '2026-04-26 03:18:28', '2026-04-26 08:39:09');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (132, 23, 5, 'Cascades', 0, 30, '2026-04-26 03:18:28', '2026-04-26 08:43:42');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (133, 23, 6, 'Collectives 2', 10, 60, '2026-04-26 03:18:28', '2026-04-26 08:48:51');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (134, 24, 1, 'Tiree de l epee', 10, 20, '2026-04-26 07:30:44', '2026-04-26 08:15:26');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (135, 24, 2, 'Collective avant mi-temps', 0, 0, '2026-04-26 07:30:44', '2026-04-26 08:13:35');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (136, 24, 3, 'Identification', 20, 20, '2026-04-26 07:30:44', '2026-04-26 08:14:26');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (137, 24, 4, 'Cascades', 0, 0, '2026-04-26 07:30:44', '2026-04-26 07:30:44');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (138, 24, 5, 'Collective apres mi-temps', 0, 20, '2026-04-26 07:30:44', '2026-04-26 08:32:04');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (139, 24, 6, 'Vrai ou Faux', 20, 30, '2026-04-26 07:30:44', '2026-04-26 08:26:12');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (152, 26, 1, 'Tiree de l epee', 10, 20, '2026-04-26 10:31:50', '2026-04-26 10:32:16');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (153, 26, 2, 'Collective avant mi-temps', 40, 20, '2026-04-26 10:31:50', '2026-04-26 10:32:16');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (154, 26, 3, 'Identification', 0, 0, '2026-04-26 10:31:50', '2026-04-26 10:31:50');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (155, 26, 4, 'Cascades', 100, 60, '2026-04-26 10:31:50', '2026-04-26 10:32:40');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (156, 26, 5, 'Collective apres mi-temps', 50, 40, '2026-04-26 10:31:50', '2026-04-26 10:32:50');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (157, 26, 6, 'Vrai ou Faux', 30, 20, '2026-04-26 10:31:50', '2026-04-26 10:33:12');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (164, 31, 1, 'Tiree de l epee', 20, 20, '2026-05-02 09:14:57', '2026-05-31 08:14:46');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (165, 31, 2, 'Collective avant mi-temps', 30, 20, '2026-05-02 09:14:57', '2026-05-31 08:17:36');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (166, 31, 3, 'Identification', 60, 50, '2026-05-02 09:14:57', '2026-05-31 08:26:38');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (167, 31, 4, 'Cascades', 20, 10, '2026-05-02 09:14:57', '2026-05-31 08:42:17');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (168, 31, 5, 'Collective apres mi-temps', 30, 40, '2026-05-02 09:14:57', '2026-05-31 08:45:02');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (169, 31, 6, 'Vrai ou Faux', 0, 70, '2026-05-02 09:14:57', '2026-05-31 08:45:02');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (170, 28, 1, 'Tiree de l epee', 10, 30, '2026-05-31 07:51:40', '2026-05-31 08:16:01');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (171, 28, 2, 'Identification', 40, 30, '2026-05-31 07:51:40', '2026-05-31 08:18:37');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (172, 28, 3, 'Collectives 1', 30, 30, '2026-05-31 07:51:40', '2026-05-31 08:21:04');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (173, 28, 4, 'Vrai ou Faux', 40, 40, '2026-05-31 07:51:40', '2026-05-31 08:29:35');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (174, 28, 5, 'Echelons', 10, 0, '2026-05-31 07:51:40', '2026-05-31 08:32:07');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (175, 28, 6, 'Collectives 2', 60, 60, '2026-05-31 07:51:40', '2026-05-31 08:38:38');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (176, 29, 1, 'Tiree de l epee', 10, 20, '2026-05-31 07:52:52', '2026-05-31 08:04:25');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (177, 29, 2, 'Identification', 40, 40, '2026-05-31 07:52:52', '2026-05-31 08:09:29');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (178, 29, 3, 'Collectives 1', 40, 60, '2026-05-31 07:52:52', '2026-05-31 08:12:24');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (179, 29, 4, 'Vrai ou Faux', 10, 20, '2026-05-31 07:52:52', '2026-05-31 08:20:37');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (180, 29, 5, 'Echelons', 100, 0, '2026-05-31 07:52:52', '2026-05-31 08:24:57');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (181, 29, 6, 'Collectives 2', 0, 50, '2026-05-31 07:52:52', '2026-05-31 08:28:08');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (182, 30, 1, 'Tiree de l epee', 30, 10, '2026-05-31 07:54:57', '2026-05-31 08:09:13');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (183, 30, 2, 'Identification', 40, 30, '2026-05-31 07:54:57', '2026-05-31 08:12:18');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (184, 30, 3, 'Collectives 1', 60, 60, '2026-05-31 07:54:57', '2026-05-31 08:15:57');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (185, 30, 4, 'Vrai ou Faux', 30, 40, '2026-05-31 07:54:57', '2026-05-31 08:21:23');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (186, 30, 5, 'Echelons', 100, 60, '2026-05-31 07:54:57', '2026-05-31 08:25:23');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (187, 30, 6, 'Collectives 2', 20, 50, '2026-05-31 07:54:57', '2026-05-31 08:29:13');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (188, 33, 1, 'Tiree de l epee', 10, 20, '2026-06-28 08:02:15', '2026-06-28 08:22:33');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (189, 33, 2, 'Identification', 0, 20, '2026-06-28 08:02:15', '2026-06-28 08:26:56');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (190, 33, 3, 'Collectives 1', 10, 40, '2026-06-28 08:02:15', '2026-06-28 08:30:54');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (191, 33, 4, 'Vrai ou Faux', 40, 40, '2026-06-28 08:02:15', '2026-06-28 08:37:30');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (192, 33, 5, 'Echelons', 0, 10, '2026-06-28 08:02:15', '2026-06-28 08:40:43');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (193, 33, 6, 'Collectives 2', 0, 10, '2026-06-28 08:02:15', '2026-06-28 08:46:31');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (194, 32, 1, 'Tiree de l epee', 30, 10, '2026-06-28 08:02:27', '2026-06-28 08:14:42');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (195, 32, 2, 'Identification', 0, 0, '2026-06-28 08:02:27', '2026-06-28 08:02:27');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (196, 32, 3, 'Collectives 1', 40, 40, '2026-06-28 08:02:27', '2026-06-28 08:22:12');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (197, 32, 4, 'Vrai ou Faux', 20, 10, '2026-06-28 08:02:27', '2026-06-28 08:33:00');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (198, 32, 5, 'Echelons', 10, 30, '2026-06-28 08:02:27', '2026-06-28 08:39:33');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (199, 32, 6, 'Collectives 2', 30, 10, '2026-06-28 08:02:27', '2026-06-28 08:44:03');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (200, 34, 1, 'Tiree de l epee', 30, 10, '2026-06-28 08:04:14', '2026-06-28 08:22:24');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (201, 34, 2, 'Identification', 30, 0, '2026-06-28 08:04:14', '2026-06-28 08:23:08');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (202, 34, 3, 'Collectives 1', 30, 40, '2026-06-28 08:04:14', '2026-06-28 08:38:27');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (203, 34, 4, 'Vrai ou Faux', 40, 30, '2026-06-28 08:04:14', '2026-06-28 08:33:48');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (204, 34, 5, 'Echelons', 10, 0, '2026-06-28 08:04:14', '2026-06-28 08:36:08');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (205, 34, 6, 'Collectives 2', 20, 20, '2026-06-28 08:04:14', '2026-06-28 08:41:03');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (206, 35, 1, 'Tiree de l epee', 10, 20, '2026-06-28 08:13:01', '2026-06-28 08:24:35');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (207, 35, 2, 'Identification', 10, 10, '2026-06-28 08:13:01', '2026-06-28 08:29:47');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (208, 35, 3, 'Collectives 1', 40, 20, '2026-06-28 08:13:01', '2026-06-28 08:35:56');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (209, 35, 4, 'Vrai ou Faux', 20, 40, '2026-06-28 08:13:01', '2026-06-28 08:42:09');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (210, 35, 5, 'Echelons', 0, 0, '2026-06-28 08:13:01', '2026-06-28 08:13:01');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (211, 35, 6, 'Collectives 2', 0, 50, '2026-06-28 08:13:01', '2026-06-28 08:49:03');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (212, 36, 1, 'Tiree de l epee', 0, 30, '2026-07-25 13:14:34', '2026-07-26 08:32:44');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (213, 36, 2, 'Collectives', 40, 40, '2026-07-25 13:14:34', '2026-07-26 08:35:39');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (214, 36, 3, 'Calcul mental', 0, 0, '2026-07-25 13:14:34', '2026-07-25 13:14:34');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (215, 36, 4, 'Recit verset', 0, 40, '2026-07-25 13:14:34', '2026-07-26 08:45:48');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (216, 36, 5, 'Decouverte (oui/non)', 0, 0, '2026-07-25 13:14:34', '2026-07-26 08:53:02');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (217, 36, 6, 'Eclairs', 90, 0, '2026-07-25 13:14:34', '2026-07-26 09:06:56');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (218, 37, 1, 'Tiree de l epee', 30, 0, '2026-07-25 13:16:05', '2026-07-26 08:02:22');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (219, 37, 2, 'Collectives', 20, 30, '2026-07-25 13:16:05', '2026-07-26 08:05:13');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (220, 37, 3, 'Calcul mental', 60, 0, '2026-07-25 13:16:05', '2026-07-26 08:08:03');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (221, 37, 4, 'Recit verset', 0, 0, '2026-07-25 13:16:05', '2026-07-26 08:13:10');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (222, 37, 5, 'Decouverte (oui/non)', 0, 0, '2026-07-25 13:16:05', '2026-07-25 13:16:05');
insert into match_trials (id, match_id, trial_order, trial_name, team1_points, team2_points, created_at, updated_at) values (223, 37, 6, 'Eclairs', 50, 30, '2026-07-25 13:16:05', '2026-07-26 08:21:56');

-- Remet à niveau les séquences IDENTITY après ces insertions à ID explicite.
select setval(pg_get_serial_sequence('tournaments', 'id'), (select max(id) from tournaments));
select setval(pg_get_serial_sequence('teams', 'id'), (select max(id) from teams));
select setval(pg_get_serial_sequence('pools', 'id'), (select max(id) from pools));
select setval(pg_get_serial_sequence('pool_teams', 'id'), (select max(id) from pool_teams));
select setval(pg_get_serial_sequence('matches', 'id'), (select max(id) from matches));
select setval(pg_get_serial_sequence('match_trials', 'id'), (select max(id) from match_trials));
