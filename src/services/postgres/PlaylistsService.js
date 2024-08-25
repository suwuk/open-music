const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylistsByOwner(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
        FROM playlists
        INNER JOIN users ON playlists.owner = users.id  
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async deletePlaylistById(playlistId, owner) {
    await this.verifyPlaylistOwner(playlistId, owner);
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal menghapus playlist. Id tidak ditemukan");
    }
  }

  async getPlaylistById(userId, playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
        FROM playlists
        INNER JOIN users ON playlists.owner = users.id  
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        WHERE playlists.owner =  $1 AND playlists.id = $2 OR collaborations.user_id =  $1`,
      values: [userId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    return result.rows[0];
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses playlist ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
