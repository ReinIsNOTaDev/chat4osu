import { TestBed } from '@angular/core/testing';
import { Actions, NgxsModule, ofActionDispatched, Store } from '@ngxs/store';
import { MultiplayerState, MultiplayerStateModel } from './multiplayer.state';
import { mockProvider } from '@ngneat/spectator';
import { StorageService } from '../../providers/storage.service';
import { AddUser, JoinMpLobby } from '../actions/multiplayer.actions';
import { SendMessageToChannel } from '../actions/message.actions';

describe('MultiplayerState', () => {
  let store: Store;
  let actions: Actions;
  let storageServiceMock: Partial<StorageService>;

  beforeEach(() => {
    storageServiceMock = {
      get: jest.fn(),
      set: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MultiplayerState])],
      providers: [mockProvider(StorageService, storageServiceMock)]
    });

    store = TestBed.inject(Store);
    actions = TestBed.inject(Actions);
  });

  it('should join an mp lobby correctly', () => {
    store.dispatch(new JoinMpLobby('#mp_test'));

    const state: MultiplayerStateModel = store.selectSnapshot(state => state.multiplayer);
    expect(state.multiplayerLobbies['#mp_test']).toBeTruthy();
    expect(state.multiplayerLobbies['#mp_test'].mpId).toBe('#mp_test');
  });

  it('should add lobby to storage if it doesn\'t exist yet', () => {
    store.dispatch(new JoinMpLobby('#mp_test'));
    expect(storageServiceMock.set).toHaveBeenCalledWith('channels', ['#osu', '#mp_test']);
  });

  it('should not add lobby to storage if it exists', () => {
    jest.spyOn(storageServiceMock, 'get').mockReturnValue(['#mp_test']);
    store.dispatch(new JoinMpLobby('#mp_test'));
    expect(storageServiceMock.set).toHaveBeenCalledTimes(0);
  });

  it('should send !mp settings to the newly created channel', (done) => {
    actions.pipe(ofActionDispatched(SendMessageToChannel)).subscribe((action: SendMessageToChannel) => {
      expect(action.payload.channel).toBe('#mp_test');
      expect(action.payload.message).toBe('!mp settings');
      done();
    });

    store.dispatch(new JoinMpLobby('#mp_test'));
  });

  it('should add a user to the correct slot', () => {
    store.reset({
      ...store.snapshot(),
      multiplayer: <MultiplayerStateModel>{
        multiplayerLobbies: {
          '#mp_test': <any>{
            players: []
          }
        }
      }
    });

    store.dispatch(new AddUser({
      channelName: '#mp_test',
      slot: 5,
      user: 'test_user'
    }));

    const state: MultiplayerStateModel = store.selectSnapshot(state => state.multiplayer);
    expect(state.multiplayerLobbies['#mp_test'].players.length).toBe(1);
    expect(state.multiplayerLobbies['#mp_test'].players[0].host).toBe(false);
    expect(state.multiplayerLobbies['#mp_test'].players[0].slot).toBe(5);
    expect(state.multiplayerLobbies['#mp_test'].players[0].team).toBeFalsy();
    expect(state.multiplayerLobbies['#mp_test'].players[0].username).toBe('test_user');
  });

  it('should order users by slot', () => {
    store.reset({
      ...store.snapshot(),
      multiplayer: <MultiplayerStateModel>{
        multiplayerLobbies: {
          '#mp_test': <any>{
            players: []
          }
        }
      }
    });

    store.dispatch(new AddUser({
      channelName: '#mp_test',
      slot: 5,
      user: 'test_user1'
    }));

    store.dispatch(new AddUser({
      channelName: '#mp_test',
      slot: 4,
      user: 'test_user2'
    }));

    store.dispatch(new AddUser({
      channelName: '#mp_test',
      slot: 3,
      user: 'test_user3'
    }));

    const state: MultiplayerStateModel = store.selectSnapshot(state => state.multiplayer);
    expect(state.multiplayerLobbies['#mp_test'].players.length).toBe(3);

    expect(state.multiplayerLobbies['#mp_test'].players[0].slot).toBe(3);
    expect(state.multiplayerLobbies['#mp_test'].players[0].username).toBe('test_user3');

    expect(state.multiplayerLobbies['#mp_test'].players[1].slot).toBe(4);
    expect(state.multiplayerLobbies['#mp_test'].players[1].username).toBe('test_user2');

    expect(state.multiplayerLobbies['#mp_test'].players[2].slot).toBe(5);
    expect(state.multiplayerLobbies['#mp_test'].players[2].username).toBe('test_user1');
  });

  it('should not add the same user twice', () => {
    store.reset({
      ...store.snapshot(),
      multiplayer: <MultiplayerStateModel>{
        multiplayerLobbies: {
          '#mp_test': <any>{
            players: []
          }
        }
      }
    });

    store.dispatch(new AddUser({
      channelName: '#mp_test',
      slot: 5,
      user: 'test_user'
    }));

    store.dispatch(new AddUser({
      channelName: '#mp_test',
      slot: 3,
      user: 'test_user'
    }));

    const state: MultiplayerStateModel = store.selectSnapshot(state => state.multiplayer);
    expect(state.multiplayerLobbies['#mp_test'].players.length).toBe(1);

    expect(state.multiplayerLobbies['#mp_test'].players[0].slot).toBe(3);
    expect(state.multiplayerLobbies['#mp_test'].players[0].username).toBe('test_user');
  });
});
