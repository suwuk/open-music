/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('playlist_song_activities', {
        id: {
          type: 'VARCHAR(50)',
          primaryKey: true,
        },
        playlist_id: {
          type: 'VARCHAR(50)',
          notNull: false,
        },
        song_id: {
          type: 'VARCHAR(50)',
          notNull: true,
        },
        user_id: {
          type: 'VARCHAR(50)',
          notNull: true,
        },
        action: {
          type: 'VARCHAR(50)',
          notNull: true,
        },
        time: {
          type: 'VARCHAR(50)',
          notNull: true,
        },
      });
    
      pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('playlist_song_activities');
};
