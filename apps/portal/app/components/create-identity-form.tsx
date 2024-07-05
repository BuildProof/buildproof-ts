import React, { useEffect, useRef, useState } from 'react'

import {
  Button,
  DialogHeader,
  Icon,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from '@0xintuition/1ui'
import { IdentityPresenter } from '@0xintuition/api'

import {
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { multivaultAbi } from '@lib/abis/multivault'
import { useCreateAtom } from '@lib/hooks/useCreateAtom'
import { useImageUploadFetcher } from '@lib/hooks/useImageUploadFetcher'
import {
  OffChainFetcherData,
  useOffChainFetcher,
} from '@lib/hooks/useOffChainFetcher'
import {
  identityTransactionReducer,
  initialIdentityTransactionState,
  useTransactionState,
} from '@lib/hooks/useTransactionReducer'
import { createIdentitySchema } from '@lib/schemas/create-identity-schema'
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_SIZE,
  MULTIVAULT_CONTRACT_ADDRESS,
} from '@lib/utils/constants'
import logger from '@lib/utils/logger'
import { truncateString } from '@lib/utils/misc'
import { useFetcher } from '@remix-run/react'
import { CreateLoaderData } from '@routes/resources+/create'
import { AlertCircle, CircleXIcon } from 'lucide-react'
import {
  IdentityTransactionActionType,
  IdentityTransactionStateType,
} from 'types/transaction'
import { toHex } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

import ErrorList from './error-list'
import { ImageChooser } from './image-chooser'
import Toast from './toast'
import TransactionStatus from './transaction-status'

interface IdentityFormProps {
  onSuccess?: () => void
  onClose: () => void
}
export function IdentityForm({ onSuccess, onClose }: IdentityFormProps) {
  logger(onClose, onSuccess)

  const { state, dispatch } = useTransactionState<
    IdentityTransactionStateType,
    IdentityTransactionActionType
  >(identityTransactionReducer, initialIdentityTransactionState)

  const [transactionResponseData, setTransactionResponseData] =
    useState<IdentityPresenter | null>(null)

  const isTransactionStarted = [
    'preparing-identity',
    'publishing-identity',
    'approve-transaction',
    'transaction-pending',
    'confirm',
    'complete',
    'error',
  ].includes(state.status)

  return (
    <>
      <>
        {!isTransactionStarted && (
          <DialogHeader className="py-4">
            <div className="absolute top-5 flex flex-row items-center gap-2 align-baseline text-primary-400">
              <div className="flex flex-col gap-1">
                <Text variant="headline" className="text-foreground-secondary">
                  Create Identity
                </Text>
                <Text variant="footnote" className="text-foreground-secondary">
                  Begin the process of establishing a new digital representation
                  within the blockchain network.
                </Text>
              </div>
            </div>
          </DialogHeader>
        )}
        <CreateIdentityForm
          state={state}
          dispatch={dispatch}
          onClose={onClose}
          setTransactionResponseData={setTransactionResponseData}
          transactionResponseData={transactionResponseData}
        />
      </>
    </>
  )
}

interface CreateIdentityFormProps {
  state: IdentityTransactionStateType
  dispatch: React.Dispatch<IdentityTransactionActionType>
  setTransactionResponseData: React.Dispatch<
    React.SetStateAction<IdentityPresenter | null>
  >
  transactionResponseData: IdentityPresenter | null
  onClose: () => void
}
export interface OffChainIdentityFetcherData {
  success: 'success' | 'error'
  identity: IdentityPresenter
  submission: SubmissionResult<string[]> | null
}

function CreateIdentityForm({
  state,
  dispatch,
  setTransactionResponseData,
  transactionResponseData,
}: CreateIdentityFormProps) {
  const { offChainFetcher, lastOffChainSubmission } = useOffChainFetcher()
  const imageUploadFetcher = useImageUploadFetcher()
  const [imageUploading, setImageUploading] = React.useState(false)
  const [identityImageSrc, setIdentityImageSrc] = React.useState<
    string | ArrayBuffer | null
  >(null)
  const [identityImageFile, setIdentityImageFile] = useState<File | undefined>(
    undefined,
  )
  const loaderFetcher = useFetcher<CreateLoaderData>()
  const loaderFetcherUrl = '/resources/create'
  const loaderFetcherRef = useRef(loaderFetcher.load)

  useEffect(() => {
    loaderFetcherRef.current = loaderFetcher.load
  })

  useEffect(() => {
    loaderFetcherRef.current(loaderFetcherUrl)
  }, [loaderFetcherUrl])

  useEffect(() => {
    logger('file changed', identityImageFile)
    if (identityImageFile) {
      if (
        !ACCEPTED_IMAGE_MIME_TYPES.includes(identityImageFile.type) ||
        identityImageFile.size > MAX_UPLOAD_SIZE
      ) {
        console.error('Invalid image file', identityImageFile)
        return
      }

      const formData = new FormData()
      formData.append('image_url', identityImageFile)

      imageUploadFetcher.submit(formData, {
        action: '/actions/upload-image',
        method: 'post',
        encType: 'multipart/form-data',
      })
    }
  }, [identityImageFile])

  useEffect(() => {
    if (
      imageUploadFetcher.data &&
      imageUploadFetcher.data?.status !== 'error'
    ) {
      setIdentityImageSrc(imageUploadFetcher.data.submission.value.image_url)
      toast.custom(
        () => (
          <Toast
            title="success"
            description="Successfully uploaded image"
            icon={<Icon name="checkmark" />}
          />
        ),
        {
          duration: 5000,
        },
      )
      setImageUploading(false)
    } else if (
      imageUploadFetcher.data &&
      imageUploadFetcher.data.status === 'error'
    ) {
      toast.custom(
        () => (
          <Toast title="Error" description="error" icon={<AlertCircle />} />
        ),
        {
          duration: 5000,
        },
      )
      setIdentityImageSrc(null)
      setImageUploading(false)
    }
  }, [imageUploadFetcher.data])

  const { atomCost: atomCostAmount } =
    (loaderFetcher.data as CreateLoaderData) ?? {
      vaultId: BigInt(0),
      atomCost: BigInt(0),
      protocolFee: BigInt(0),
      entryFee: BigInt(0),
    }

  const atomCost = BigInt(atomCostAmount ? atomCostAmount : 0)
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const {
    writeContractAsync: writeCreateIdentity,
    awaitingWalletConfirmation,
    awaitingOnChainConfirmation,
  } = useCreateAtom()
  const emitterFetcher = useFetcher()

  const createdIdentity = offChainFetcher?.data?.identity
  // const createdIdentity = identity

  const [loading, setLoading] = useState(false)
  const [imageFilename, setImageFilename] = useState<string | null>(null)
  const [imageFilesize, setImageFilesize] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const handleFileChange = (filename: string, filesize: string) => {
    setImageFilename(filename)
    setImageFilesize(filesize)
  }
  const [formTouched, setFormTouched] = useState(false) // to disable submit if user hasn't touched form yet

  const isTransactionStarted = [
    'preparing-identity',
    'publishing-identity',
    'approve-transaction',
    'transaction-pending',
    'confirm',
    'complete',
    'error',
  ].includes(state.status)

  const statusMessages = {
    'preparing-identity': 'Preparing Identity...',
    'publishing-identity': 'Publishing Identity...',
    'approve-transaction': 'Approve Transaction...',
    'transaction-pending': 'Transaction Pending...',
    confirm: 'Confirming...',
    complete: 'Identity created successfully',
    error: 'Failed to create identity',
  }

  const isTransactionAwaiting = (status: string) =>
    ['approve-transaction'].includes(status)
  const isTransactionProgress = (status: string) =>
    [
      'preparing-identity',
      'publishing-identity',
      'transaction-pending',
    ].includes(status)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    logger('form submitting')
    try {
      if (walletClient) {
        dispatch({ type: 'PREPARING_IDENTITY' })
        const formData = new FormData()
        formData.append('display_name', event.currentTarget.display_name.value)
        if (event.currentTarget.description.value !== undefined) {
          formData.append('description', event.currentTarget.description.value)
        }
        if (identityImageSrc !== null) {
          formData.append('image_url', identityImageSrc as string) // add check to this once we allow for null
        }

        if (event.currentTarget.external_reference?.value !== undefined) {
          const prefixedUrl = `https://${event.currentTarget.external_reference?.value}`
          formData.append('external_reference', prefixedUrl)
        }

        // Initial form validation
        const submission = parseWithZod(formData, {
          schema: createIdentitySchema(),
        })

        if (
          submission.status === 'error' &&
          submission.error !== null &&
          Object.keys(submission.error).length
        ) {
          console.error('Create identity validation errors: ', submission.error)
        }

        setLoading(true)
        dispatch({ type: 'START_IMAGE_UPLOAD' })

        try {
          logger('try offline submit')
          dispatch({ type: 'PUBLISHING_IDENTITY' })
          offChainFetcher.submit(formData, {
            action: '/actions/create-identity',
            method: 'post',
          })
        } catch (error: unknown) {
          if (error instanceof Error) {
            const errorMessage = 'Error in creating offchain identity data.'
            dispatch({
              type: 'TRANSACTION_ERROR',
              error: errorMessage,
            })
            toast.custom(
              () => (
                <Toast
                  title="Error"
                  description={errorMessage}
                  icon={<AlertCircle />}
                />
              ),
              {
                duration: 5000,
              },
            )
            dispatch({ type: 'START_TRANSACTION' })
            return
          }
          console.error('Error creating identity', error)
        }

        setLoading(true)
      }
      // }
    } catch (error: unknown) {
      logger(error)
    }
  }

  async function handleOnChainCreateIdentity({
    atomData,
  }: {
    atomData: string
  }) {
    if (
      !awaitingOnChainConfirmation &&
      !awaitingWalletConfirmation &&
      publicClient &&
      atomCost
    ) {
      try {
        dispatch({ type: 'APPROVE_TRANSACTION' })

        const txHash = await writeCreateIdentity({
          address: MULTIVAULT_CONTRACT_ADDRESS,
          abi: multivaultAbi,
          functionName: 'createAtom',
          args: [toHex(atomData)],
          value: atomCost,
        })

        if (txHash) {
          dispatch({ type: 'TRANSACTION_PENDING' })
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
          })
          logger('receipt', receipt)
          logger('txHash', txHash)
          dispatch({
            type: 'TRANSACTION_COMPLETE',
            txHash: txHash,
            txReceipt: receipt,
            identityId: transactionResponseData?.id,
          })
        }
      } catch (error) {
        logger('error', error)
        setLoading(false)
        if (error instanceof Error) {
          let errorMessage = 'Failed transaction'
          if (error.message.includes('insufficient')) {
            errorMessage = 'Insufficient funds'
          }
          if (error.message.includes('rejected')) {
            errorMessage = 'Transaction rejected'
          }
          dispatch({
            type: 'TRANSACTION_ERROR',
            error: errorMessage,
          })
          toast.custom(
            () => (
              <Toast
                title="Error"
                description={errorMessage}
                icon={<AlertCircle />}
              />
            ),
            {
              duration: 5000,
            },
          )
          return
        }
      }
    } else {
      logger(
        'Cannot initiate onchain transaction, a transaction is already pending, a wallet is already signing, or a wallet is not connected',
      )
    }
  }

  function handleIdentityTxReceiptReceived() {
    logger('createdIdentity', createdIdentity)
    if (createdIdentity) {
      logger(
        'Submitting to emitterFetcher with identity_id:',
        createdIdentity.identity_id,
      )
      emitterFetcher.submit(
        { identity_id: createdIdentity.identity_id },
        { method: 'post', action: '/actions/create-emitter' },
      )
    }
  }

  useEffect(() => {
    if (state.status === 'complete') {
      handleIdentityTxReceiptReceived()
      logger('complete!')
    }
  }, [state.status])

  useEffect(() => {
    if (
      offChainFetcher.state === 'idle' &&
      offChainFetcher.data !== null &&
      offChainFetcher.data !== undefined
    ) {
      const responseData = offChainFetcher.data as OffChainFetcherData
      logger('responseData', responseData)
      if (responseData !== null) {
        if (createdIdentity !== undefined && responseData.identity) {
          logger('responseData', responseData)
          const { identity_id } = responseData.identity
          setTransactionResponseData(responseData.identity)
          logger('responseData identity', responseData.identity)
          logger('onchain create starting. identity_id:', identity_id)
          handleOnChainCreateIdentity({ atomData: identity_id })
        }
      }
      if (offChainFetcher.data === null || offChainFetcher.data === undefined) {
        console.error('Error in offchain data creation.:', offChainFetcher.data)
        dispatch({
          type: 'TRANSACTION_ERROR',
          error: 'Error in offchain data creation.',
        })
      }
    }
  }, [offChainFetcher.state, offChainFetcher.data, dispatch])

  useEffect(() => {
    if (state.status === 'error') {
      setLoading(false)
    }
  }, [state.status])

  const [form, fields] = useForm({
    id: 'create-identity',
    lastResult: lastOffChainSubmission,
    constraint: getZodConstraint(createIdentitySchema()),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createIdentitySchema,
      })
    },
    shouldValidate: 'onInput',
    onSubmit: async (e) => handleSubmit(e),
  })
  return (
    <offChainFetcher.Form
      method="post"
      {...getFormProps(form)}
      encType="multipart/form-data"
      action="/actions/create-identity"
    >
      {!isTransactionStarted ? (
        <div className="w-full py-1 flex-col justify-start items-start inline-flex gap-9">
          <div className="flex flex-col w-full gap-1.5">
            <div className="self-stretch flex-col justify-start items-start flex mt-9">
              <Text variant="caption" className="text-secondary-foreground/90">
                Identity Display Picture
              </Text>
            </div>
            <div className="self-stretch h-[100px] px-9 py-2.5 bg-neutral-900 rounded-lg border border-solid border-white/10 justify-between items-center inline-flex">
              <div className="justify-start items-center gap-[18px] flex">
                <div className="w-[60px] h-[60px] rounded-xl justify-center items-center flex">
                  <ImageChooser
                    previewImage={previewImage}
                    setPreviewImage={setPreviewImage}
                    onFileChange={handleFileChange}
                    setImageFile={setIdentityImageFile}
                    disabled={imageUploading}
                    {...getInputProps(fields.image_url, { type: 'file' })}
                  />
                </div>
                <div className="flex-col justify-start items-start inline-flex">
                  <div className="text-center text-neutral-200 text-sm font-normal leading-tight">
                    {truncateString(imageFilename ?? '', 36)}
                  </div>
                  <div className="text-center text-neutral-200 text-xs font-normal leading-[18px]">
                    {imageFilesize}
                  </div>
                </div>
              </div>
              <div className="flex-col justify-end items-end inline-flex">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setPreviewImage(null)
                    setImageFilename(null)
                    setImageFilesize(null)
                  }}
                  className={`${previewImage === null ? 'hidden' : 'block'}`}
                >
                  <CircleXIcon className="h-6 w-6 relative text-neutral-700 hover:text-neutral-600 transition-colors duration-300" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full gap-1.5">
            <Text variant="caption" className="text-secondary-foreground/90">
              Identity Name
            </Text>
            <Label htmlFor={fields.display_name.id} hidden>
              Identity Name
            </Label>
            <Input
              {...getInputProps(fields.display_name, { type: 'text' })}
              placeholder="Enter a display name"
              className="border border-solid border-white/10 bg-neutral-900"
              onChange={() => setFormTouched(true)}
            />
            <ErrorList
              id={fields.display_name.errorId}
              errors={fields.display_name.errors}
            />
          </div>
          <div className="flex flex-col w-full gap-1.5">
            <Text variant="caption" className="text-secondary-foreground/90">
              Identity Description
            </Text>
            <Label htmlFor={fields.description.id} hidden>
              Identity Description
            </Label>
            <Textarea
              {...getInputProps(fields.description, { type: 'text' })}
              placeholder="Tell us about yourself!"
              className="h-20 border border-solid border-white/10 bg-neutral-900"
            />
          </div>
          <div className="flex flex-col w-full gap-1.5">
            <Text variant="caption" className="text-secondary-foreground/90">
              Add Link
            </Text>
            <Label htmlFor={fields.external_reference.id} hidden>
              Add Link
            </Label>

            <div className="flex items-center overflow-hidden border border-solid border-white/10 bg-neutral-900 rounded-md relative">
              <span className="font-medium text-secondary-foreground py px-2 border-r border-solid border-white/10">
                https://
              </span>
              <Input
                {...getInputProps(fields.external_reference, { type: 'text' })}
                placeholder="Enter an external link"
                className="border-white/10 bg-neutral-900 rounded-none border-none"
              />
            </div>
            <ErrorList
              id={fields.external_reference.errorId}
              errors={fields.external_reference.errors}
            />
          </div>
          <Button
            form={form.id}
            type="submit"
            variant="primary"
            disabled={loading || !formTouched}
            className="mx-auto"
          >
            Create
          </Button>
        </div>
      ) : (
        <TransactionStatus
          transactionType="identity"
          state={state}
          dispatch={dispatch}
          transactionDetail={transactionResponseData?.id}
          statusMessages={statusMessages}
          isTransactionAwaiting={isTransactionAwaiting}
          isTransactionProgress={isTransactionProgress}
        />
      )}
    </offChainFetcher.Form>
  )
}