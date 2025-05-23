import { gql } from '@apollo/client'
import { useFormik } from 'formik'
import { forwardRef } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { object, string } from 'yup'

import { Alert, Button, Dialog, DialogRef, Typography } from '~/components/designSystem'
import { ComboBoxField } from '~/components/form'
import { addToast } from '~/core/apolloClient'
import { LAGO_TAX_DOCUMENTATION_URL } from '~/core/constants/externalUrls'
import { IntegrationsTabsOptionsEnum } from '~/core/constants/tabsOptions'
import { countryDataForCombobox } from '~/core/formats/countryDataForCombobox'
import { TAX_MANAGEMENT_INTEGRATION_ROUTE } from '~/core/router'
import {
  CountryCode,
  UpdateOrganizationInput,
  useUpdateOrgaForLagoTaxManagementMutation,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useIntegrations } from '~/hooks/useIntegrations'

gql`
  mutation updateOrgaForLagoTaxManagement($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      id
    }
  }
`

export type AddLagoTaxManagementDialogRef = DialogRef

interface AddStripDialog {
  country?: CountryCode | null
}

export const AddLagoTaxManagementDialog = forwardRef<AddLagoTaxManagementDialogRef, AddStripDialog>(
  ({ country }: AddStripDialog, ref) => {
    const { translate } = useInternationalization()
    const { hasTaxProvider } = useIntegrations()
    const navigate = useNavigate()
    const formikProps = useFormik<UpdateOrganizationInput>({
      initialValues: {
        country,
      },
      validationSchema: object().shape({
        country: string().required(''),
      }),
      onSubmit: async (values) => {
        await updateOrga({
          variables: {
            input: {
              ...values,
              euTaxManagement: true,
            },
          },
        })
      },
      validateOnMount: true,
      enableReinitialize: true,
    })
    const [updateOrga] = useUpdateOrgaForLagoTaxManagementMutation({
      onCompleted({ updateOrganization }) {
        if (updateOrganization?.id) {
          navigate(
            generatePath(TAX_MANAGEMENT_INTEGRATION_ROUTE, {
              integrationGroup: IntegrationsTabsOptionsEnum.Lago,
            }),
          )
          addToast({
            message: translate('text_657078c28394d6b1ae1b980e'),
            severity: 'success',
          })
        }
      },
    })

    return (
      <Dialog
        ref={ref}
        title={translate('text_657078c28394d6b1ae1b974d')}
        description={
          <Typography
            variant="body"
            color="grey600"
            html={translate('text_657078c28394d6b1ae1b9759', {
              href: LAGO_TAX_DOCUMENTATION_URL,
            })}
          />
        }
        onClose={() => {
          formikProps.resetForm()
        }}
        actions={({ closeDialog }) => (
          <>
            <Button variant="quaternary" onClick={closeDialog}>
              {translate('text_63eba8c65a6c8043feee2a14')}
            </Button>
            <Button
              variant="primary"
              disabled={!formikProps.isValid}
              onClick={async () => {
                await formikProps.submitForm()
                closeDialog()
              }}
            >
              {translate('text_657078c28394d6b1ae1b9789')}
            </Button>
          </>
        )}
      >
        <div className="mb-8 flex flex-col gap-8">
          <ComboBoxField
            data={countryDataForCombobox}
            name="country"
            label={translate('text_657078c28394d6b1ae1b9765')}
            placeholder={translate('text_657078c28394d6b1ae1b9771')}
            formikProps={formikProps}
            PopperProps={{ displayInDialog: true }}
          />

          {hasTaxProvider && (
            <Alert type="info">
              <Typography variant="body" color="grey700">
                {translate('text_66ba65e562cbc500f04c7dbb')}
              </Typography>
            </Alert>
          )}
        </div>
      </Dialog>
    )
  },
)

AddLagoTaxManagementDialog.displayName = 'AddLagoTaxManagementDialog'
