import { screen, waitFor } from '@testing-library/react';

import { DatabaseConstants } from 'gatsby-plugin-firebase';

import { createResumeButtonDataTestId } from '../../../components/dashboard/CreateResume';
import setup, {
  setupAndWaitForLoadingScreenToDisappear,
  expectResumeToBeRenderedInPreview,
  expectLoadingScreenToBeRendered,
  waitForLoadingScreenToDisappear,
} from './helpers/dashboard';

const user = DatabaseConstants.user1;

it('renders loading screen', async () => {
  await setup(user);

  expect(expectLoadingScreenToBeRendered()).toBeUndefined();
  await waitForLoadingScreenToDisappear();
});

it('renders document title', async () => {
  await setupAndWaitForLoadingScreenToDisappear(user);

  await waitFor(() => {
    expect(document.title).toEqual('Dashboard | Reactive Resume');
  });
});

it('renders create resume', async () => {
  await setupAndWaitForLoadingScreenToDisappear(user);

  await waitFor(() => {
    expect(screen.getByText(/create resume/i)).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(
      screen.getByTestId(createResumeButtonDataTestId),
    ).toBeInTheDocument();
  });
});

it('renders preview of user resumes', async () => {
  const userResumes = await setupAndWaitForLoadingScreenToDisappear(user);

  expect(Object.keys(userResumes)).toHaveLength(2);

  await expectResumeToBeRenderedInPreview(Object.values(userResumes)[0].name);
  await expectResumeToBeRenderedInPreview(Object.values(userResumes)[1].name);
});
