/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable("songs", {
        id: {
          type: "VARCHAR(50)",
          primaryKey: true,
        },
        title: {
          type: "TEXT",
          notNull: true,
        },
        year: {
          type: "SMALLINT",
          notNull: true,
        },
        genre: {
          type: "TEXT",
          notNull: true,
        },
        performer: {
          type: "TEXT",
          notNull: true,
        },
        duration: {
          type: "SMALLINT",
        },
        album_id: {
          type: "TEXT",
          references: "albums(id)",
          onDelete: "SET NULL",
        },
      });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable("songs");
};
