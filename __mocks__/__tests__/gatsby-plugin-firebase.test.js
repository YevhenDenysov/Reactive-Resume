import FirebaseStub from '../gatsby-plugin-firebase';

describe('FirebaseStub', () => {
  const resumesPath = FirebaseStub.database().resumesPath;
  const usersPath = FirebaseStub.database().usersPath;

  describe('auth', () => {
    afterEach(() => {
      FirebaseStub.auth().dispose();
    });

    it('reuses existing Auth instance', () => {
      const auth1 = FirebaseStub.auth();
      const auth2 = FirebaseStub.auth();

      expect(auth1.uuid).toBeTruthy();
      expect(auth2.uuid).toBeTruthy();
      expect(auth1.uuid).toEqual(auth2.uuid);
    });

    it('returns anonymous user when signing in anonymously', async () => {
      const user = await FirebaseStub.auth().signInAnonymously();

      expect(user).toBeTruthy();
      expect(user).toEqual(FirebaseStub.auth().anonymousUser);
    });

    it('calls onAuthStateChanged observer with anonymous user when signing in anonymously', async () => {
      let user = null;
      let error = null;
      FirebaseStub.auth().onAuthStateChanged(
        (_user) => {
          user = _user;
        },
        (_error) => {
          error = _error;
        },
      );

      await FirebaseStub.auth().signInAnonymously();

      expect(user).toBeTruthy();
      expect(user).toEqual(FirebaseStub.auth().anonymousUser);
      expect(error).toBeNull();
    });

    it('onAuthStateChanged unsubscribe removes observer', () => {
      const observer = () => {};
      const unsubscribe = FirebaseStub.auth().onAuthStateChanged(observer);
      expect(unsubscribe).toBeTruthy();
      expect(FirebaseStub.auth().onAuthStateChangedObservers.length).toEqual(1);
      expect(FirebaseStub.auth().onAuthStateChangedObservers[0]).toEqual(
        observer,
      );

      unsubscribe();

      expect(FirebaseStub.auth().onAuthStateChangedObservers.length).toEqual(0);
    });
  });

  describe('database', () => {
    it('reuses existing Database instance', () => {
      const database1 = FirebaseStub.database();
      const database2 = FirebaseStub.database();

      expect(database1.uuid).toBeTruthy();
      expect(database2.uuid).toBeTruthy();
      expect(database1.uuid).toEqual(database2.uuid);
    });

    it('reuses existing Reference instance', () => {
      const ref1 = FirebaseStub.database().ref(`${resumesPath}/123`);
      const ref2 = FirebaseStub.database().ref(`${resumesPath}/123`);

      expect(ref1.uuid).toBeTruthy();
      expect(ref2.uuid).toBeTruthy();
      expect(ref1.uuid).toEqual(ref2.uuid);
    });

    it('ServerValue.TIMESTAMP returns current time in milliseconds', () => {
      const now = new Date().getTime();
      const timestamp = FirebaseStub.database.ServerValue.TIMESTAMP;

      expect(timestamp).toBeTruthy();
      expect(timestamp).toBeGreaterThanOrEqual(now);
    });

    it("can spy on Reference 'update' function", async () => {
      const referencePath = `${resumesPath}/123456`;
      const functionSpy = jest.spyOn(
        FirebaseStub.database().ref(referencePath),
        'update',
      );
      const updateArgument = 'test value 123';

      await FirebaseStub.database().ref(referencePath).update(updateArgument);

      expect(functionSpy).toHaveBeenCalledTimes(1);
      const functionCallArgument = functionSpy.mock.calls[0][0];
      expect(functionCallArgument).toBeTruthy();
      expect(functionCallArgument).toEqual(updateArgument);
    });

    it('initializing data sets up resumes and users', async () => {
      FirebaseStub.database().initializeData();

      const resumesRef = FirebaseStub.database().ref(resumesPath);
      const resumesDataSnapshot = await resumesRef.once('value');
      const resumes = resumesDataSnapshot.val();
      expect(resumes).toBeTruthy();
      expect(Object.keys(resumes).length).toEqual(2);
      const demoStateResume =
        resumes[FirebaseStub.database().demoStateResumeId];
      expect(demoStateResume).toBeTruthy();
      expect(demoStateResume.id).toEqual(
        FirebaseStub.database().demoStateResumeId,
      );
      const initialStateResume =
        resumes[FirebaseStub.database().initialStateResumeId];
      expect(initialStateResume).toBeTruthy();
      expect(initialStateResume.id).toEqual(
        FirebaseStub.database().initialStateResumeId,
      );

      const usersRef = FirebaseStub.database().ref(usersPath);
      const usersDataSnapshot = await usersRef.once('value');
      const users = usersDataSnapshot.val();
      expect(users).toBeTruthy();
      expect(Object.keys(users).length).toEqual(1);
      const anonymousUser = users[FirebaseStub.database().anonymousUser.uid];
      expect(anonymousUser).toBeTruthy();
      expect(anonymousUser).toEqual(FirebaseStub.database().anonymousUser);
    });

    it('retrieves resume if it exists', async () => {
      FirebaseStub.database().initializeData();

      const resume = (
        await FirebaseStub.database()
          .ref(`${resumesPath}/${FirebaseStub.database().demoStateResumeId}`)
          .once('value')
      ).val();

      expect(resume).toBeTruthy();
      expect(resume.id).toEqual(FirebaseStub.database().demoStateResumeId);
    });

    it('retrieves null if resume does not exist', async () => {
      FirebaseStub.database().initializeData();
      const resumeId = 'invalidResumeId';

      const resume = (
        await FirebaseStub.database()
          .ref(`${resumesPath}/${resumeId}`)
          .once('value')
      ).val();

      expect(resume).toBeNull();
    });

    it('retrieves user if it exists', async () => {
      FirebaseStub.database().initializeData();

      const user = (
        await FirebaseStub.database()
          .ref(`${usersPath}/${FirebaseStub.database().anonymousUser.uid}`)
          .once('value')
      ).val();

      expect(user).toBeTruthy();
      expect(user).toEqual(FirebaseStub.database().anonymousUser);
    });

    it('retrieves null if user does not exist', async () => {
      FirebaseStub.database().initializeData();
      const userId = 'invalidUserId';

      const user = (
        await FirebaseStub.database()
          .ref(`${usersPath}/${userId}`)
          .once('value')
      ).val();

      expect(user).toBeNull();
    });
  });
});
