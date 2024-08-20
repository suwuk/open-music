const autoBind = require("auto-bind");
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapActivities } = require("../../utils");

class PlaylistSongsService {
  constructor(playlistsService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async addSongToPlaylist(playlistId, userId, songId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    await this.addActivity(playlistId, songId, userId, "add");
    const id = `songsplaylist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Gagal menambahkan lagu ke dalam playlist");
    }
  }

  async getSongsFromPlaylistId(playlistId, userId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    const playlists = await this._playlistsService.getPlaylistById(
      userId,
      playlistId
    );
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
        FROM playlists
        INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
        INNER JOIN songs ON songs.id = playlistsongs.song_id
        WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal mengambil lagu dari playlist");
    }

    return { ...playlists, songs: result.rows };
  }

  async deleteSongFromPlaylistId(playlistId, userId, songId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this.addActivity(playlistId, songId, userId, "delete");

    const query = {
      text: "DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        "Gagal menghapus lagu dari playlist. Id tidak ditemukan"
      );
    }
  }

  async getPlaylistActivitiesById(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, a.action, a.time
      FROM playlist_song_activities a
      INNER JOIN songs s
      ON a.song_id = s.id
      INNER JOIN users u
      ON a.user_id = u.id
      WHERE playlist_id = $1
      ORDER BY a.time ASC`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapActivities);
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activities-${nanoid(16)}`;
    const timestamp = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, playlistId, songId, userId, action, timestamp],
    };

    const result = await this._pool.query(query);
    return result;
  }
}

module.exports = PlaylistSongsService;
